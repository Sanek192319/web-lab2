import { createTransport } from "nodemailer";
import sanitizeHtml from "sanitize-html";
require("dotenv").config();

const transport = createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendMail(options) {
  try {
    await transport.sendMail(options);
    return { success: true };
  } catch (error) {
    throw CustomException("Error in sending email", 500);
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
  const count = history.get(ip) || 0;
  if (count >= limit) {
    throw CustomException("too many requests", 429);
  }
  history.set(ip, count + 1);
};

function CustomException(message, status) {
  const error = new Error(message);

  error.status = status;
  return error;
}

const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameValid = /[a-zA-ZЁёА-я]+$/;

const validate = (body) => {
  const { email, name, password, confirmPassword } = body;
  console.log(body);
  if (!email || !name || !password || !confirmPassword) {
    throw CustomException("Fields can not be empty", 400);
  }
  if (!emailValid.test(email)) {
    throw CustomException("Email not valid", 400);
  }
  if (!nameValid.test(name)) {
    throw CustomException("Name not valid", 400);
  }
  if (password !== confirmPassword) {
    throw CustomException("Password doesn't match", 400);
  }
};

module.exports = async (req, res) => {
  try {
    rateLimit(req.headers["x-real-ip"], 2);
    validate(req.body);
    const result = await formSubmit(req.body);
    res.json({ result });
  } catch (e) {
    return res.status(e.status).json({
      status: e.status,
      errors: [e.message],
      result: {
        success: false,
      },
    });
  }
};
