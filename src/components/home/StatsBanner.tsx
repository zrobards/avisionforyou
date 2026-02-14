export default function StatsBanner() {
  return (
    <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div><div className="text-5xl font-bold mb-2">500+</div><p className="text-brand-green">Lives Transformed</p></div>
          <div><div className="text-5xl font-bold mb-2">7</div><p className="text-brand-green">Recovery Residences</p></div>
          <div><div className="text-5xl font-bold mb-2">6</div><p className="text-brand-green">Program Types</p></div>
          <div><div className="text-5xl font-bold mb-2">100%</div><p className="text-brand-green">Tax-Deductible</p></div>
        </div>
      </div>
    </section>
  )
}
