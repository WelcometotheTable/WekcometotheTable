import { faq } from '../data/faq.ts';
import './Faq.css';

export function Faq() {
  return (
    <main className="faq">
      <h1 className="faq__title">A seat at the table — questions, answered</h1>
      {faq.map((item) => (
        <section key={item.q} className="faq__item">
          <h2 className="faq__q">{item.q}</h2>
          <p className="faq__a">{item.a}</p>
        </section>
      ))}
    </main>
  );
}
