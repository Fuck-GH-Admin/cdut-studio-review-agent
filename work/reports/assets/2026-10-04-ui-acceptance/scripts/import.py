import subprocess,sys,time,os,json
from pathlib import Path
root='/tmp/cdut-ui-acceptance-20261003'
display=Path(root+'/display').read_text()
xvfb=next(line for line in subprocess.check_output(['ps','-eo','args'],text=True).splitlines() if line.startswith('Xvfb '+display+' '))
auth=xvfb.split(' -auth ',1)[1].split()[0]
env={**os.environ,'DISPLAY':display,'XAUTHORITY':auth}
def x(*args): return subprocess.check_output(['xdotool',*args],env=env,text=True).strip()
subprocess.run(['node',root+'/ui.mjs','click','导入材料'],check=True)
subprocess.run(['node',root+'/ui.mjs','contains','导入'+sys.argv[1]],check=True)
time.sleep(.4)
wid=x('search','--name','^导入审核材料$').splitlines()[-1]
x('windowactivate','--sync',wid)
x('key','--delay','100','ctrl+l')
time.sleep(.2)
g=dict(line.split('=',1) for line in x('getwindowgeometry','--shell',wid).splitlines() if '=' in line)
x('mousemove','--window',wid,'550','23','click','--repeat','3','--delay','120','1','key','BackSpace')
x('type','--delay','10',root+'/fixtures/'+sys.argv[2])
x('mousemove','--window',wid,str(int(g['WIDTH'])-55),str(int(g['HEIGHT'])-28),'click','1')
time.sleep(.6)
print('原生选择框导入：'+sys.argv[2])
