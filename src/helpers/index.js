export const countDays = (start, end, exclude = []) => {
  const days = [];
  start = new Date(new Date(start).setHours(0, 0, 0, 0));
  end = new Date(new Date(end).setHours(0, 0, 0, 0));

  for (
    var d = new Date(new Date(start).setHours(0, 0, 0, 0));
    d <= end;
    d.setDate(d.getDate() + 1)
  ) {
    if (d >= start && !exclude.includes(d.getDay())) {
      days.push(new Date(d));
    }
  }

  return days.length;
};

Array.prototype.swap = function (oldIndex, newIndex) {
  const a = this[oldIndex],
    b = this[newIndex];
  this[newIndex] = a;
  this[oldIndex] = b;
  return this;
};

Number.prototype.pad = function (l) {
  let zeros = "";
  for (let i = 0; i < l; i++) zeros += "0";
  return zeros.length >= `${this}`.length ? (zeros + this).slice(-l) : this;
};

Date.prototype.ago = function (time) {
  const [sec, min, hour, day, month, year] = time
    .split(" ")
    .map((t) => parseInt(t))
    .filter((t) => !isNaN(t));

  let date = new Date(this);
  if (sec) {
    date = new Date(date.setSeconds(date.getSeconds() - sec));
  }
  if (min) {
    date = new Date(date.setMinutes(date.getMinutes() - min));
  }
  if (hour) {
    date = new Date(date.setHours(date.getHours() - hour));
  }
  if (day) {
    date = new Date(date.setDate(date.getDate() - day));
  }
  if (month) {
    date = new Date(date.setMonth(date.getMonth() - month));
  }
  if (year) {
    date = new Date(date.setYear(date.getFullYear() - year));
  }

  return date;
};
Date.prototype.later = function (time) {
  const [sec, min, hour, day, month, year] = time
    .split(" ")
    .map((t) => parseInt(t))
    .filter((t) => !isNaN(t));

  let date = new Date(this);
  if (sec) {
    date = new Date(date.setSeconds(date.getSeconds() + sec));
  }
  if (min) {
    date = new Date(date.setMinutes(date.getMinutes() + min));
  }
  if (hour) {
    date = new Date(date.setHours(date.getHours() + hour));
  }
  if (day) {
    date = new Date(date.setDate(date.getDate() + day));
  }
  if (month) {
    date = new Date(date.setMonth(date.getMonth() + month));
  }
  if (year) {
    date = new Date(date.setYear(date.getFullYear() + year));
  }

  return date;
};
