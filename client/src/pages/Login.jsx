import React,{useState} from 'react';
export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const submit=async(e)=>{e.preventDefault();const r=await fetch('http://localhost:4000/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();localStorage.setItem('token',d.access_token);alert('logged in');};
  return <form onSubmit={submit} style={{padding:20}}><h2>Login</h2><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/><br/><input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)}/><br/><button>Login</button></form>;
}
