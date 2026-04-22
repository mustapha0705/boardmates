import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.PRISMA_LOG_QUERIES === 'true' ? ['query', 'error'] : ['error'],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to database');
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        process.exit(1);
    }
}

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('Disconnected from database');
    } catch (error) {
        console.error('Error disconnecting from database:', error.message);
        process.exit(1);
    }
}

export {prisma, connectDB, disconnectDB};