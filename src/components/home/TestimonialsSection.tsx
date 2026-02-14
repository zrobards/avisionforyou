const TESTIMONIALS = [
  {
    name: "Josh J.",
    role: "Client / Intern",
    quote: "A Vision for You is the best treatment center I have ever been to. It is the longest amount of sobriety in my life. I struggle with mental illness, and I am allowed to take my medication, and the staff is very accommodating."
  },
  {
    name: "Laura F.",
    role: "Alumni / Staff",
    quote: "I moved here from Georgia seeking help with my addiction. After trying many facilities, AVFY has succeeded in showing me a new way to live. They've given me hope and I'm now employed and a full-time student."
  },
  {
    name: "Johnny M.",
    role: "Alumni / Staff",
    quote: "14 months ago, I was hopeless, jobless, and homeless. AVFY took me in with open arms. I now work there helping others. AVFY has given me my life back, and I am eternally grateful."
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <p className="text-gray-600 italic mb-4 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <hr className="my-4" />
              <p className="font-bold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
