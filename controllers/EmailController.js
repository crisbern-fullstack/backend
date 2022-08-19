const { sendEmail } = require("../email-test");
const EmailModel = require("../models/EmailModel");
const schedule = require("node-schedule");
const mongoose = require("mongoose");

let jobs = {};

const AllEmails = async (req, res) => {
  try {
    const emails = await EmailModel.find({ sent: req.query.sent }).sort({
      createdAt: -1,
    });
    return res.status(200).json(emails);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

const GetOneEmail = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const email = await EmailModel.findById(id);

  if (!email) {
    return res.status(404).json({ message: "Email Not Found" });
  }

  return res.status(200).json(email);
};

const DeleteEmail = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const deleted_mail = await EmailModel.findByIdAndDelete(id);

  if (!deleted_mail) {
    return res.status(404).json({ message: "Mail not found." });
  }

  if (!deleted_mail.sent) {
    try {
      jobs[deleted_mail._id].cancel();
    } catch (error) {
      console.log("Job does not exist");
    }
  }

  return res.status(200).json(deleted_mail);
};

const SendEmail = async (req, res) => {
  const receivers = req.body.receivers;
  const email_args = {
    sender: req.body.sender,
    receivers: receivers.split(" "),
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
    date: req.body.date,
    sent: req.body.sent,
  };
  try {
    await sendEmail(email_args);
    await EmailModel.create(email_args);
    return res.status(200).json({ message: "Email Succesfully Sent" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Sending failed. Make sure you filled up the fields appropriately",
    });
  }
};

const SendScheduledEmail = async (req, res) => {
  const receivers = req.body.receivers;
  const email_args = {
    sender: req.body.sender,
    receivers: receivers.split(" "),
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
    date: req.body.date,
    sent: req.body.sent,
  };

  const scheduled_email = await EmailModel.create(email_args);
  res.status(200).json({ message: "Email successfully scheduled" });

  jobs[scheduled_email._id] = schedule.scheduleJob(req.body.date, async () => {
    try {
      await sendEmail(email_args);
      const updateSent = await EmailModel.findOneAndUpdate(
        { _id: scheduled_email._id },
        { sent: true }
      );
    } catch (error) {
      console.log(error);
    }
  });
  res.end();
};

module.exports = {
  AllEmails,
  GetOneEmail,
  SendEmail,
  SendScheduledEmail,
  DeleteEmail,
};
