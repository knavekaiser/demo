const countDays = (start, end, exclude = []) => {
  const days = [];

  for (
    var d = new Date(new Date(start).setHours(0, 0, 0, 0));
    d <= new Date(new Date(end).setHours(0, 0, 0, 0));
    d.setDate(d.getDate() + 1)
  ) {
    if (d > start && !exclude.includes(d.getDay())) {
      days.push(new Date(d));
    }
  }

  return days.length;
};

const wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

export { countDays, wait };
