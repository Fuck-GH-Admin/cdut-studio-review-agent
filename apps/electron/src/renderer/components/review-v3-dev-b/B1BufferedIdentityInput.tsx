/**
 * Author-only identity editing buffer. A partial IME/key sequence is not an
 * attempted source/field/target rename. Commit one complete value on blur or
 * Enter; reject invalid/occupied IDs through the existing immutable author
 * identity graph helper, not by rewriting references on every keystroke.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface B1BufferedIdentityInputProps {
  value: string
  className?: string
  onCommit: (nextId: string) => void
}
export function B1BufferedIdentityInput({
  value,className,onCommit,
}:B1BufferedIdentityInputProps):ReactNode {
  const [editing,setEditing]=useState(false)
  const [buffer,setBuffer]=useState(value)
  const composing=useRef(false)
  const cancelled=useRef(false)

  useEffect(()=>{
    if(!editing)setBuffer(value)
  },[value,editing])
  const finish=():void=>{
    const next=cancelled.current?value:buffer
    cancelled.current=false
    setEditing(false)
    setBuffer(value)
    if(next!==value)onCommit(next)
  }
  return <input className={className} value={editing?buffer:value}
    onFocus={()=>{setBuffer(value);cancelled.current=false;setEditing(true)}}
    onChange={event=>setBuffer(event.target.value)}
    onCompositionStart={()=>{composing.current=true}}
    onCompositionEnd={()=>{composing.current=false}}
    onBlur={finish}
    onKeyDown={event=>{
      if(event.key==='Escape'){
        cancelled.current=true
        event.currentTarget.blur()
      }else if(event.key==='Enter' && !composing.current &&
               !event.nativeEvent.isComposing){
        event.preventDefault()
        event.currentTarget.blur()
      }
    }}
  />
}
