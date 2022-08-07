import { createCipheriv, createDecipheriv } from "crypto";
import { appConfig } from "../config";

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

export const wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

export const encrypt = (data) => {
  let cipher = createCipheriv(
    "aes-256-cbc",
    Buffer.from(appConfig.aes_key),
    appConfig.iv_key
  );
  return Buffer.concat([cipher.update(data), cipher.final()]).toString("hex");
};
export const decrypt = (text) => {
  let decrypted;
  try {
    let decipher = createDecipheriv(
      "aes-256-cbc",
      Buffer.from(appConfig.aes_key),
      appConfig.iv_key
    );
    decrypted = Buffer.concat([
      decipher.update(Buffer.from(text, "hex")),
      decipher.final(),
    ]).toString();
  } catch (err) {
    // do nothing
  }
  return decrypted;
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
