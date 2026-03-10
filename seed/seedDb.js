import dotenv from 'dotenv';

dotenv.config();


import mongoose from 'mongoose';

const storedAdminCred = ()=>{
    // Connect to MongoDB
mongoose.connect(process.env.MONGO_URL,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User Schema
const userSchema = new mongoose.Schema({
  adminEmail: { type: String, unique: true, required: true },
  adminPassword: { type: String, required: true, select: false},
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Seed function
const seedDatabase = async () => {
  await User.deleteMany(); // Clear existing users first

  const adminUser = new User({
    adminEmail:process.env.ADMIN_EMAIL,            // Set a username for the admin
    adminPassword:process.env.ADMIN_PASSWORD,       // Use the specified passw
  });

  await adminUser.save();
  
  console.log('Database seeded with admin user.');
};

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seeding complete.');
    mongoose.connection.close(); // Close the connection after seeding
  })
  .catch((error) => {
    console.error('Error while seeding the database:', error);
    mongoose.connection.close();
  });
};


export default storedAdminCred;