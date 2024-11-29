'use client';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Creator',
      image: 'https://i.pravatar.cc/150?img=1',
      quote: 'I started with the free tier to test it out. After seeing how much time it saved me, upgrading to Pro was a no-brainer. Now I convert all my YouTube content into blog posts!',
    },
    {
      name: 'Michael Chen',
      role: 'Tech Blogger',
      image: 'https://i.pravatar.cc/150?img=2',
      quote: 'The free tier helped me validate my content strategy. Pro tier\'s 50+ monthly videos lets me scale my blog content effortlessly. Great investment!',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Digital Marketer',
      image: 'https://i.pravatar.cc/150?img=3',
      quote: 'The free trial let me experience the power of AI transcription firsthand. Now I can\'t imagine my content workflow without it.',
    },
  ];

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of content creators who trust Tube2Text
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <blockquote className="mt-6">
                <p className="text-gray-600 italic">&ldquo;{testimonial.quote}&rdquo;</p>
              </blockquote>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2">
            <span className="text-gray-600">Join our growing community</span>
            <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Get Started Free
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
