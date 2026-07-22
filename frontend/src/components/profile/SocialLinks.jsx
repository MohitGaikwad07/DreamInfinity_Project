import React from 'react';
import { FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi';

export const SocialLinks = ({ socialLinks = {} }) => {
  const { github, linkedin, portfolioWebsite } = socialLinks;

  if (!github && !linkedin && !portfolioWebsite) {
    return <span className="text-xs text-violet-100/40">No external links configured.</span>;
  }

  return (
    <div className="flex items-center gap-3">
      {github && (
        <a 
          href={github.startsWith('http') ? github : `https://${github}`} 
          target="_blank" 
          rel="noreferrer" 
          className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 hover:text-white hover:border-violet-600/30 hover:bg-violet-600/10 transition-all duration-200"
          title="GitHub Profile"
        >
          <FiGithub className="text-sm" />
        </a>
      )}

      {linkedin && (
        <a 
          href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} 
          target="_blank" 
          rel="noreferrer" 
          className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 hover:text-white hover:border-violet-600/30 hover:bg-violet-600/10 transition-all duration-200"
          title="LinkedIn Profile"
        >
          <FiLinkedin className="text-sm" />
        </a>
      )}

      {portfolioWebsite && (
        <a 
          href={portfolioWebsite.startsWith('http') ? portfolioWebsite : `https://${portfolioWebsite}`} 
          target="_blank" 
          rel="noreferrer" 
          className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 hover:text-white hover:border-violet-600/30 hover:bg-violet-600/10 transition-all duration-200"
          title="Portfolio Website"
        >
          <FiGlobe className="text-sm" />
        </a>
      )}
    </div>
  );
};
