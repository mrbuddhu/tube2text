'use client';

export default function ConversionMetrics() {
  const metrics = [
    {
      value: '$0',
      label: 'To Start',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: '$29.99',
      label: 'Pro Monthly',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      value: '50+',
      label: 'Videos/Month',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      icon: '⚡',
      value: '< 2min',
      label: 'Processing Time',
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trusted by Content Creators Worldwide
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of creators who trust Tube2Text for their content repurposing needs
          </p>
        </div>
        
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              <dt>
                <div className="absolute rounded-md p-3 bg-indigo-50">
                  {metric.icon}
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {metric.label}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-indigo-600">
                  {metric.value}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
