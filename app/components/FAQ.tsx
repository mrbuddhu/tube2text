'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'How accurate is the transcription?',
    answer:
      'Our AI-powered transcription system achieves over 95% accuracy for clear audio in English. For other languages and videos with background noise, accuracy may vary but typically remains above 90%.',
  },
  {
    question: 'What video lengths are supported?',
    answer:
      'Free users can transcribe videos up to 30 minutes in length. Pro users can transcribe videos up to 2 hours, and Enterprise users have custom limits based on their needs.',
  },
  {
    question: 'Which languages are supported?',
    answer:
      'We currently support transcription for 30+ languages including English, Spanish, French, German, Chinese, Japanese, and more. The full list is available in our documentation.',
  },
  {
    question: 'Can I edit the transcribed text?',
    answer:
      'Yes, all transcribed text can be edited in our web editor. Pro users also have access to advanced formatting tools and AI-powered editing suggestions.',
  },
  {
    question: 'How is my data protected?',
    answer:
      'We use industry-standard encryption for all data in transit and at rest. Your transcriptions are private by default and can only be accessed by you and team members you explicitly share them with.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer:
      'If you reach your monthly limit, you can upgrade your plan at any time. We'll notify you when you're approaching your limit so you can plan accordingly.',
  },
];

export const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                        <span className="text-base font-semibold leading-7">{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          <ChevronDownIcon
                            className={`h-6 w-6 ${open ? 'rotate-180' : ''} transition-transform`}
                            aria-hidden="true"
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
