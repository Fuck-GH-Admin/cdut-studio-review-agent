#!/usr/bin/env python3
"""Start/stop only this run's isolated Vite and Electron processes."""
import argparse
import datetime
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import time
from urllib.request import urlopen


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def get_raw_root(value):
    raw = Path(value).resolve()
    if not raw.name.startswith('p06-office71-local-r02-'):
        raise SystemExit('拒绝非 Office71 R02 原始证据目录')
    raw.mkdir(parents=True, exist_ok=True)
    return raw


def metadata_path(raw, kind):
    return raw / 'setup' / f'runtime-{kind}.json'


def wait_http(port, path='/json/list', expected=True, process=None, timeout=90):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process is not None and process.poll() is not None:
            raise RuntimeError(f'子进程提前退出，code={process.returncode}')
        try:
            with urlopen(f'http://127.0.0.1:{port}{path}', timeout=2) as response:
                data = response.read()
            if expected:
                return json.loads(data)
            return True
        except Exception:
            time.sleep(0.25)
    raise TimeoutError(f'loopback 端口 {port} 未就绪')


def start(args):
    raw = get_raw_root(args.raw_root)
    root = Path(__file__).resolve().parents[2]
    setup = raw / 'setup'
    setup.mkdir(parents=True, exist_ok=True)
    if args.kind == 'vite':
        env = os.environ.copy()
        env.update({
            'PROFER_DEV': '1',
            'PROFER_DEV_INSTANCE': raw.name,
            'PROFER_VITE_PORT': str(args.vite_port),
            'P06_OFFICE71_RAW_ROOT': str(raw),
            'P06_OFFICE71_MATERIAL_ROOT': str(raw / 'materials'),
        })
        argv = ['bun', 'run', '--filter=@profer/electron', 'dev:vite']
        cwd = root
    else:
        profile = raw / 'profile'
        binary = root / 'node_modules' / 'electron' / 'dist' / 'electron'
        if not binary.is_file():
            binary = root / 'apps' / 'electron' / 'node_modules' / 'electron' / 'dist' / 'electron'
        if not binary.is_file():
            raise SystemExit('隔离工作树内未找到 frozen-install Electron binary')
        env = os.environ.copy()
        env.update({
            'PROFER_DEV': '1',
            'PROFER_DEV_INSTANCE': raw.name,
            'PROFER_VITE_PORT': str(args.vite_port),
            'QA_PROFILE_ROOT': str(profile),
            'PROFER_CONFIG_DIR': str(profile / 'config'),
            'PROFER_USER_DATA_DIR': str(profile / 'user-data'),
            'P06_OFFICE71_RAW_ROOT': str(raw),
            'P06_OFFICE71_MATERIAL_ROOT': str(raw / 'materials'),
            'QA_MAIN_PORT': str(args.main_port),
            'QA_CDP_PORT': str(args.renderer_port),
            'QA_APPLICATION_SHA': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
            'ELECTRON_OVERRIDE_DIST_PATH': str(binary.parent),
            'ELECTRON_ENABLE_LOGGING': '1',
            'NO_COLOR': '1',
        })
        argv = [
            'xvfb-run', '-a', '-s', '-screen 0 1600x1000x24', str(binary), '.', '--no-sandbox',
            '--disable-gpu', f'--remote-debugging-port={args.renderer_port}',
            f'--user-data-dir={profile / "user-data"}',
        ]
        cwd = root / 'apps' / 'electron'

    state_file = metadata_path(raw, args.kind)
    if state_file.exists():
        prior = json.loads(state_file.read_text())
        if process_alive(prior.get('pid')):
            raise SystemExit(f'{args.kind} 已在运行，拒绝重复启动 pid={prior["pid"]}')
    stdout_path = setup / f'runtime-{args.kind}.stdout.log'
    stderr_path = setup / f'runtime-{args.kind}.stderr.log'
    stdout = stdout_path.open('ab')
    stderr = stderr_path.open('ab')
    proc = subprocess.Popen(argv, cwd=cwd, env=env, stdout=stdout, stderr=stderr, start_new_session=True)
    state = {
        'kind': args.kind, 'pid': proc.pid, 'pgid': proc.pid, 'argv': argv, 'cwd': str(cwd),
        'startedAt': utc_now(), 'sourceSha': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
        'vitePort': args.vite_port, 'mainPort': args.main_port, 'rendererPort': args.renderer_port,
        'stdout': str(stdout_path), 'stderr': str(stderr_path),
    }
    state_file.write_text(json.dumps(state, indent=2) + '\n')
    try:
        if args.kind == 'vite':
            wait_http(args.vite_port, '/', expected=False, process=proc)
        else:
            main_targets = wait_http(args.main_port, process=proc)
            renderer_targets = wait_http(args.renderer_port, process=proc)
            state['mainTargets'] = [{'type': x.get('type'), 'url': x.get('url')} for x in main_targets]
            state['rendererTargets'] = [{'type': x.get('type'), 'url': x.get('url')} for x in renderer_targets]
            state['readyAt'] = utc_now()
            state_file.write_text(json.dumps(state, indent=2) + '\n')
    except Exception:
        stop_kind(raw, args.kind)
        raise
    print(json.dumps({'kind': args.kind, 'pid': proc.pid, 'ports': [args.vite_port, args.main_port, args.renderer_port]}))


def process_alive(pid):
    if not isinstance(pid, int):
        return False
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False


def stop_kind(raw, kind):
    state_file = metadata_path(raw, kind)
    if not state_file.exists():
        print(json.dumps({'kind': kind, 'status': 'NOT_RUNNING'}))
        return
    state = json.loads(state_file.read_text())
    pid = state.get('pid')
    if process_alive(pid):
        try:
            proc_cmd = Path(f'/proc/{pid}/cmdline').read_bytes().replace(b'\x00', b' ').decode(errors='replace')
        except OSError:
            proc_cmd = ''
        expected = ('electron' if kind == 'electron' else 'vite')
        if expected not in proc_cmd.lower() and kind == 'vite' and 'bun' not in proc_cmd.lower():
            raise SystemExit(f'pid={pid} 已不再匹配本轮 {kind} 进程；拒绝终止')
        try:
            os.killpg(int(state.get('pgid', pid)), signal.SIGTERM)
        except ProcessLookupError:
            pass
        deadline = time.monotonic() + 20
        while time.monotonic() < deadline and process_alive(pid):
            time.sleep(0.2)
        if process_alive(pid):
            os.killpg(int(state.get('pgid', pid)), signal.SIGKILL)
    state['stoppedAt'] = utc_now()
    state['stopped'] = True
    state_file.write_text(json.dumps(state, indent=2) + '\n')
    print(json.dumps({'kind': kind, 'pid': pid, 'status': 'STOPPED'}))


def allocate_ports(raw):
    sockets = []
    values = []
    try:
        for name in ['vitePort', 'mainPort', 'rendererPort']:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('127.0.0.1', 0))
            sockets.append(sock)
            values.append((name, sock.getsockname()[1]))
        result = {'host': '127.0.0.1', 'ports': dict(values), 'allocatedAt': utc_now()}
        (raw / 'setup' / 'ports.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result))
    finally:
        for sock in sockets:
            sock.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['allocate-ports', 'start', 'stop'])
    parser.add_argument('--kind', choices=['vite', 'electron'])
    parser.add_argument('--raw-root', required=True)
    parser.add_argument('--vite-port', type=int)
    parser.add_argument('--main-port', type=int)
    parser.add_argument('--renderer-port', type=int)
    args = parser.parse_args()
    raw = get_raw_root(args.raw_root)
    if args.action == 'allocate-ports':
        allocate_ports(raw)
    elif not args.kind:
        raise SystemExit('--kind is required for start/stop')
    elif not all([args.vite_port, args.main_port, args.renderer_port]):
        raise SystemExit('--vite-port, --main-port and --renderer-port are required for start/stop')
    elif args.action == 'start':
        start(args)
    else:
        stop_kind(raw, args.kind)


if __name__ == '__main__':
    main()
