import React,{useEffect,useState} from 'react';
export default function Courses(){
  const [courses,setCourses]=useState([]);
  useEffect(()=>{fetch('http://localhost:4000/courses').then(r=>r.json()).then(setCourses).catch(()=>{});},[]);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Courses</h2>
      <div className="grid gap-4">
        {courses.map(c=>(
          <div key={c.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">{c.title}</h3>
            <p className="text-gray-500">{c.description}</p>
          </div>
        ))}
        {courses.length===0 && <p className="text-gray-400">No published courses yet.</p>}
      </div>
    </div>
  );
}
