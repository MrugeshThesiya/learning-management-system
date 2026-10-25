import React,{useState} from 'react';
export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const submit=async(e)=>{e.preventDefault();const r=await fetch('http://localhost:4000/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();localStorage.setItem('token',d.access_token);alert('logged in');};
  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-10 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input className="w-full mb-3 p-2 border border-gray-300 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="w-full mb-3 p-2 border border-gray-300 rounded" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
    </form>
  );
}
