import logging
import sys

def setup_logger(name="prospect-on"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Formatter limpo
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    
    # Handler robusto para o console com suporte a UTF-8 no Windows
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(formatter)
    
    # Tenta forçar utf-8 para evitar crashes no buffer do Windows
    try:
        import io
        if isinstance(sys.stdout, io.TextIOWrapper):
            sys.stdout.reconfigure(encoding='utf-8')
    except (AttributeError, ImportError):
        pass
    
    logger.addHandler(ch)
    # Evitar propagação duplicada
    logger.propagate = False
    
    return logger

logger = setup_logger()
