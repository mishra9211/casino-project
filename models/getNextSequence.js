const Counter = require("./Counter");

async function getNextSequence(id, reference_value) {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error("id must be a non-empty string");
  }
  if (!reference_value || typeof reference_value !== "string" || reference_value.trim() === "") {
    throw new Error("reference_value must be a non-empty string");
  }

  const counter = await Counter.findOneAndUpdate(
    { id: id.trim(), reference_value: reference_value.trim() },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return counter.seq;
}

module.exports = getNextSequence;
