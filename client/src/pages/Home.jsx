import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Home = () => {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="text-center w-full max-w-4xl py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6 ring-1 ring-indigo-200">
                        Kelajagingizni biz bilan quring
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                        Bilim olish — bu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Buyuk Kelajak</span> poydevori
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Matematika va Ingliz tili kurslarimizda bilimingizni oshiring. Malakali o'qituvchilar va zamonaviy dars metodikasi.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="rounded-full px-8 text-base">
                                Hoziroq boshlash <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/courses">
                            <Button size="lg" variant="outline" className="rounded-full px-8 text-base">
                                Kurslar haqida
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-3 gap-8 py-16 w-full">
                <FeatureCard
                    icon={<BookOpen className="h-8 w-8 text-indigo-600" />}
                    title="Sifatli Ta'lim"
                    description="Eng so'nggi metodikalar asosida tayyorlangan dars dasturlari."
                />
                <FeatureCard
                    icon={<Users className="h-8 w-8 text-purple-600" />}
                    title="Tajribali Ustozlar"
                    description="O'z sohasining proffessional mutaxassislari sizga ta'lim beradi."
                />
                <FeatureCard
                    icon={<Clock className="h-8 w-8 text-pink-600" />}
                    title="Qulay Vaqt"
                    description="Darslarni o'zingizga qulay vaqtda tanlash imkoniyati."
                />
            </section>

            {/* Stats or CTA */}
            <section className="w-full bg-indigo-600 rounded-3xl p-12 text-center text-white my-16 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold mb-6">Birinchi darsga bepul yoziling!</h2>
                    <p className="text-indigo-100 mb-8 text-lg max-w-xl mx-auto">
                        Sinov darsida qatnashib ko'ring va bizning ta'lim sifatimizga ishonch hosil qiling.
                    </p>
                    <Link to="/register">
                        <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none font-semibold px-8 rounded-full">
                            Ro'yxatdan o'tish
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
    >
        <div className="bg-gray-50 p-4 rounded-xl w-fit mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
);

export default Home;
