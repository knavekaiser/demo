const countDays = (start, end, exclude = []) => {
  const days = [];

  for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d > start && !exclude.includes(d.getDay())) {
      days.push(new Date(d));
    }
  }

  return days.length;
};

export { countDays };
