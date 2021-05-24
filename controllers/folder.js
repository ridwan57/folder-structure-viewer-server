const Folder = require("../model/Folder");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

exports.createFolder = async (req, res) => {
  const { name, parent } = req.body;

  try {
    const data = parent
      ? await Folder.create({ name, parent })
      : await Folder.create({ name });
    if (parent) {
      const update = await Folder.findByIdAndUpdate(
        parent,
        {
          $addToSet: {
            children: data._id,
          },
        },
        { new: true }
      ).exec();
      res.json({ id: data._id });
    } else {
      res.json({ id: data._id });
    }
  } catch (error) {
    res.json({ error });
  }
};

exports.getAllFolders = async (req, res) => {
  const data = await Folder.find({});
  const filtered = data.map(({ _id, name, children, parent }) => ({
    id: _id,
    name,
    children,
    parent,
  }));
  res.json({ data: filtered });
};

async function buildQuery(id) {
  const data = await Folder.findById(id);

  const { parent, children } = data;

  if (children.length > 0) {
    children.map((child) => {
      buildQuery(child);
    });
  } else {
    await Folder.findByIdAndDelete(data._id);
    return;
  }
  await Folder.findByIdAndDelete(data._id);
}

exports.deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  const rootData = await Folder.findById(folderId);
  const { parent, children } = rootData;
  if (!parent) {
    res.json({ error: "root folder" });
  }
  const updateParent = await Folder.findByIdAndUpdate(
    parent,
    {
      $pull: {
        children: rootData._id,
      },
    },
    { new: true }
  ).exec();

  if (children.length > 0) {
    children.map((child) => {
      buildQuery(child);
    });
    res.json({ rootData });
  } else {
    await Folder.findByIdAndDelete(rootData);
    res.json({ rootData });
  }
};
