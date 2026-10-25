import React,{useEffect,useState} from 'react';
export default function Courses(){
  const [courses,setCourses]=useState([]);
  useEffect(()=>{fetch('http://localhost:4000/courses').then(r=>r.json()).then(setCourses);},[]);
  return <div style={{padding:20}}><h2>Courses</h2><ul>{courses.map(c=><li key={c.id}>{c.title}</li>)}</ul></div>;
}
