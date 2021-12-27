import { createTransport } from "nodemailer";
import sanitizeHtml from "sanitize-html";
require("dotenv").config();

function getTransporter() {
  return createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

async function sendMail(options) {
  try {
    const transport = getTransporter();
    await transport.sendMail(options);
    return { success: true };
  } catch (error) {
    throw new Error(error?.message);
  }
}
const from = `Form submision - ${process.env.EMAIL_ADRESS}`;
async function formSubmit(formData) {
  let html = "";
  for (const option in formData) {
    html += option + " : " + formData[option] + "<br/>";
  }
  return sendMail({
    from,
    to: process.env.EMAIL_TO_USER,
    subject: "New form submision",
    html: sanitizeHtml(html),
  });
}

const history = new Map();
const rateLimit = (ip, limit = 3) => {
  if (!history.has(ip)) {
    history.set(ip, 0);
  }
  if (history.get(ip) > limit) {
    throw new Error();
  }
  history.set(ip, history.get(ip) + 1);
};

const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameValid = /[a-zA-ZЁёА-я]+$/;

const validate = (body) => {
  const { email, name, password, confirmPassword } = body;
  console.log(body);
  if (!email || !name || !password || !confirmPassword) {
    throw new Error();
  }
  if (!emailValid.test(email)) {
    throw new Error();
  }
  if (!nameValid.test(name)) {
    throw new Error();
  }
  if (password !== confirmPassword) {
    throw new Error();
  }
};

module.exports = async (req, res) => {
  try {
    rateLimit(req.headers["x-real-ip"], 1);
  } catch (e) {
    return res.status(429).json({
      status: 429,
      errors: ["too many requests"],
      result: {
        success: false,
      },
    });
  }
  try {
    validate(req.body);
  } catch (e) {
    return res.status(403).json({
      status: 403,
      errors: ["Validation error"],
      result: {
        success: false,
      },
    });
  }
  const result = await formSubmit(req.body);
  res.json({ result });
};
