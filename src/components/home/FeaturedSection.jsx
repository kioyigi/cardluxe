import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FeaturedSection({ title, subtitle, linkText, linkUrl, children }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-zinc-400 text-lg">{subtitle}</p>
            )}
          </div>
          {linkUrl && (
            <Link 
              to={linkUrl}
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium mt-4 md:mt-0 transition-colors"
            >
              {linkText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}