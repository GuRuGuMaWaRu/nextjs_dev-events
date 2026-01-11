interface Props {
  agendaItems: string[];
}

const EventAgenda = ({ agendaItems }: Props) => {
  return (
    <section className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

export default EventAgenda;
