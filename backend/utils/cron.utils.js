import cron from "node-cron";
import DailyChallenge from "../models/DailyChallenge.model.js";
import User from "../models/user.model.js";
import Problems from "../models/problem.model.js";

cron.schedule('0 0 * * *', async () => {
    try {
     
      const randomProblem = await getRandomProblem();
      
      await DailyChallenge.create({
        date: new Date().setHours(0, 0, 0, 0),
        problem: randomProblem._id
      });
      
      await User.updateMany(
        { 
          isCompletedToday: false,
          lastCompleted: { 
            $lt: new Date(new Date().setDate(new Date().getDate() - 1)) 
          }
        },
        { $set: { currentStreak: 0 } }
      );
  
      await User.updateMany(
        { isCompletedToday: true },
        { $set: { isCompletedToday: false } }
      );
    } catch (error) {
      console.error('Daily cron job failed:', error);
    }
  });


  async function getRandomProblem() {
    const count = await Problems.countDocuments();
    const random = Math.floor(Math.random() * count);
    return Problems.findOne().skip(random);
  }

export default cron;