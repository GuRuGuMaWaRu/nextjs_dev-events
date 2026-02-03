const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag, index) => (
        <div key={`${tag}-${index}`} className="pill">
          {tag}
        </div>
      ))}
    </div>
  );
};

export default EventTags;
