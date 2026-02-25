const { db } = require('../firebaseAdmin');

const saveContact = async (req, res) => {
  try {
    const { 
        fname,lname,cname,email,number,service,message
     } = req.body;

    const newContact = await db.collection('contacts').add({
      fname,
      lname,
      cname,
      email,
      number,
      service,
      message,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      id: newContact.id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
        success: false,
        message: error.message
     });
  }
};

module.exports = { saveContact };