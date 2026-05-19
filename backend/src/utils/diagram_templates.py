import os

class DiagramTemplate:
    """
    Utility based on Cathryn Lavery's Diagram Design system.
    Generates premium HTML/SVG diagrams for Prospect-On 3.0 reports.
    """
    
    # Prospect-On 3.0 Color Palette
    STYLE = {
        "paper": "#020617",  # Slate-950
        "ink": "#f8fafc",    # Slate-50
        "accent": "#22d3ee", # Cyan-400
        "muted": "#94a3b8",  # Slate-400
        "success": "#34d399",# Emerald-400
    }

    @staticmethod
    def get_header(title: str, eyebrow: str = "PROSPECT-ON 3.0"):
        return f"""
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
            <style>
                body {{
                    background-color: {DiagramTemplate.STYLE['paper']};
                    color: {DiagramTemplate.STYLE['ink']};
                    font-family: 'Geist', sans-serif;
                    margin: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }}
                .eyebrow {{
                    font-family: 'Geist Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 0.2em;
                    color: {DiagramTemplate.STYLE['accent']};
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }}
                h1 {{
                    font-family: 'Instrument Serif', serif;
                    font-size: 48px;
                    font-weight: 400;
                    margin: 0 0 40px 0;
                }}
                .diagram-container {{
                    width: 100%;
                    max-width: 800px;
                }}
            </style>
        </head>
        <body>
            <div class="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <div class="diagram-container">
        """

    @staticmethod
    def get_footer():
        return """
            </div>
        </body>
        </html>
        """

    @staticmethod
    def generate_flowchart(nodes, connections):
        # Placeholder for complex SVG generation logic following the 4px grid rule
        # This will be expanded as needed for specific reports
        pass
