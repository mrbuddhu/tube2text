'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'How does Tube2Text work?',
    answer:
      'Tube2Text uses advanced AI to transcribe and process YouTube videos. Simply paste a YouTube URL, and we will generate high-quality text content from the video.',
  },
  {
    question: 'What are credits and how do they work?',
    answer:
      'Credits are our payment system. Each video processing costs 1 credit. You can purchase credits through our various plans, and they never expire.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer:
      'If you reach your monthly limit, you can upgrade your plan at any time. We will notify you when you are approaching your limit so you can plan accordingly.',
  },
  {
    question: 'How do I purchase more credits?',
    answer:
      'Click on any plan in our pricing section, complete the PayPal payment, and email us your transaction ID. We will add credits to your account within 24 hours.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We currently accept PayPal for all payments. This ensures secure and reliable transactions for our users worldwide.',
  },
  {
    question: 'How long does it take to process a video?',
    answer:
      'Processing time depends on the video length and complexity. Most videos are processed within 5-10 minutes.',
  },
];

export default function FAQ() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <div key={faq.question} className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
