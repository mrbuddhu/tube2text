'use client';

export default function TrustBadges() {
  const badges = [
    {
      name: 'Free Forever Tier',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '3 videos per month, forever free',
    },
    {
      name: 'Pro Features',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: '50+ videos/month, priority support',
    },
    {
      name: 'No Credit Card',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Start free, upgrade when ready',
    },
    {
      name: 'Money Back',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
        </svg>
      ),
      description: '30-day satisfaction guarantee',
    },
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-50 text-indigo-600">
                {badge.icon}
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{badge.name}</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
