import logging
from typing import List, Optional
import json

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None
    _max_seq_length = 256 # Default, updated on load

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                model_name = 'sentence-transformers/all-MiniLM-L6-v2'
                self._model = SentenceTransformer(model_name)
                self._max_seq_length = getattr(self._model, "max_seq_length", 256)
                logger.info(f"Loaded embedding model {model_name} with max_seq_length={self._max_seq_length}")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise e
        return self._model

    def _truncate_text(self, text: str) -> str:
        """
        Truncate text deterministically based on character heuristic 
        to stay roughly within max_seq_length tokens.
        1 token ~= 4 chars roughly.
        """
        if not text:
            return ""
        max_chars = self._max_seq_length * 4
        if len(text) > max_chars:
            return text[:max_chars]
        return text

    def generate_embedding(self, text: str) -> Optional[List[float]]:
        if not text or not text.strip():
            return None
        try:
            model = self._get_model()
            truncated_text = self._truncate_text(text.strip())
            # Convert to list of floats
            embedding = model.encode(truncated_text).tolist()
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None

    def generate_student_embedding(self, student, skills: List[str], education: List[str], experience: List[str], projects: List[str]) -> Optional[List[float]]:
        try:
            components = []
            if getattr(student, 'preferred_job_roles', None):
                roles = student.preferred_job_roles
                if isinstance(roles, list):
                    roles_str = ', '.join(roles)
                else:
                    roles_str = str(roles)
                components.append(f"Role: {roles_str}")
            if student.about_me:
                components.append(f"About: {student.about_me}")
            if skills:
                components.append(f"Skills: {', '.join(skills)}")
            if education:
                components.append(f"Education: {'; '.join(education)}")
            if experience:
                components.append(f"Experience: {'; '.join(experience)}")
            if projects:
                components.append(f"Projects: {'; '.join(projects)}")
            
            text = "\n".join(components)
            return self.generate_embedding(text)
        except Exception as e:
            logger.error(f"Error building student embedding text: {e}")
            return None

    def generate_job_embedding(self, job, required_skills: List[str], preferred_skills: List[str]) -> Optional[List[float]]:
        try:
            components = []
            if job.title:
                components.append(f"Title: {job.title}")
            if job.department:
                components.append(f"Department: {job.department}")
            if job.category:
                components.append(f"Category: {job.category}")
            if job.description:
                components.append(f"Description: {job.description}")
            if job.responsibilities:
                components.append(f"Responsibilities: {job.responsibilities}")
            if required_skills:
                components.append(f"Required Skills: {', '.join(required_skills)}")
            if preferred_skills:
                components.append(f"Preferred Skills: {', '.join(preferred_skills)}")
            
            text = "\n".join(components)
            return self.generate_embedding(text)
        except Exception as e:
            logger.error(f"Error building job embedding text: {e}")
            return None

embedding_service = EmbeddingService()
