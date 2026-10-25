export default function Home(){
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to LMS</h1>
      <p className="text-gray-600 text-lg">Learn, track progress, take quizzes and assignments.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {['Courses','Quizzes','Progress'].map(t=>(
          <div key={t} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold text-blue-600">{t}</h3>
            <p className="text-gray-500 mt-2">Explore {t.toLowerCase()} features.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
