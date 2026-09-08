import { Star, User } from "lucide-react"

const testimonials = [
  {
    name: "Emily R.",
    rating: 5,
    message: "Posted a subto with the rate and PITI already on the card. Serious replies within a day.",
  },
  {
    name: "Jordan M.",
    rating: 5,
    message: "Finally a board where people know what seller finance actually means. Terms over price.",
  },
  {
    name: "Taylor S.",
    rating: 4,
    message: "I’ve bought two things on here already. Love how it’s just for Loophole users.",
  },
]

const Testomonials = () => {
  return (
    <section className="py-12 px-4 md:px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        What Investors Are Saying
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-zinc-100 text-black rounded-full p-2">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <div className="flex text-yellow-400">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 italic">“{t.message}”</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testomonials;
