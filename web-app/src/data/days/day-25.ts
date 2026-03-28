import type { Day } from '../../types';

export const day25: Day = {
  day: 25,
  phase: 5,
  title: "Document AI: Agentic Extraction",
  partner: "LandingAI",
  tags: ["ocr", "document-ai", "extraction", "visual-grounding"],
  concept: "Intelligent document processing with agentic reasoning and visual grounding",

  demoUrl: "demos/day-25/",
  demoDescription: "Explore the evolution from OCR to agentic extraction, build extraction schemas, and see visual grounding in action.",

  lesson: {
    overview: `Documents are the dark matter of enterprise data - billions of PDFs, scans, and forms holding information that AI systems cannot access. Traditional OCR extracts text but loses everything that makes documents meaningful: the layout that distinguishes a header from body text, the table structure that relates values to columns, the visual flow that guides human readers.

Agentic Document Extraction represents a paradigm shift. Instead of character-level pattern matching, LandingAI's ADE treats documents as visual objects with semantic structure. The Document Pre-trained Transformer (DPT-2) understands that a number appearing in the "Total" column of a table means something different than the same number in a footnote. This is document understanding, not just document reading.

The key innovation is visual grounding - every extracted value maps to exact coordinates in the source document. When your agent extracts "$50,000" as a contract value, it can point to the precise location on page 3 where that number appears. This traceability eliminates the black-box problem that plagues LLM-based extraction and provides the audit trail that compliance-heavy industries require.

Building on the agent foundations from Days 3 and 24, document AI agents orchestrate multiple extraction steps with reasoning between them: parse the document, identify relevant sections, apply schema-based extraction, cross-reference values, and flag low-confidence results for human review. The pattern is familiar - observe, reason, act, verify - but applied to the specialized domain of document understanding.`,

    principles: [
      {
        title: "Vision-First, Text-Second",
        description: "Process documents as visual objects, not text streams. Layout, tables, and charts carry semantic meaning that text extraction loses. Document Pre-trained models are trained on document structure, not just language."
      },
      {
        title: "Schema-Driven Extraction",
        description: "Define expected output structure with Pydantic models. Field descriptions guide the extraction model, and structured output enables downstream automation with type safety."
      },
      {
        title: "Visual Grounding for Traceability",
        description: "Every extracted value maps to source coordinates (bounding boxes). This enables verification, audit trails, and error diagnosis - critical for compliance and human-in-the-loop workflows."
      },
      {
        title: "Confidence-Based Routing",
        description: "Not all extractions are equally reliable. Route high-confidence results to automation and low-confidence results to human review. Set thresholds appropriate to your error tolerance."
      },
      {
        title: "Chunk-Based Processing",
        description: "Documents decompose into semantic chunks (paragraphs, tables, figures) that preserve structure. Markdown output serves RAG pipelines, while structured chunks enable precise analysis."
      }
    ],

    codeExample: {
      language: "python",
      title: "Quick Start: LandingAI Agentic Document Extraction",
      code: `"""Quick Start: LandingAI Agentic Document Extraction"""

from pathlib import Path
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema
from pydantic import BaseModel, Field

# Define what you want to extract
class Invoice(BaseModel):
    vendor: str = Field(description="Company that issued the invoice")
    total: float = Field(description="Total amount due")
    due_date: str = Field(description="Payment due date")

# Initialize client (uses VISION_AGENT_API_KEY env var)
client = LandingAIADE()

# Parse document with visual understanding
parsed = client.parse(
    document=Path("invoice.pdf"),
    model="dpt-2-latest"
)

# Access markdown output (great for RAG)
print("Markdown:", parsed.markdown[:200])

# Access structured chunks with bounding boxes
for chunk in parsed.chunks:
    print(f"Type: {chunk.type}, Page: {chunk.grounding.bounding_box.page}")

# Extract structured fields from parsed content
result = client.extract(
    schema=pydantic_to_json_schema(Invoice),
    markdown=parsed.markdown
)

print(f"Vendor: {result.data.vendor}")
print(f"Total: \${result.data.total:.2f}")
print(f"Due: {result.data.due_date}")

# Check confidence per field
for field, meta in result.metadata.items():
    print(f"  {field}: confidence={meta.confidence:.2f}")`
    },

    diagram: {
      type: "mermaid",
      title: "Agentic Document Extraction Flow",
      mermaid: `flowchart TD
    DOC["PDF Document"] --> PARSE["DPT-2 Parse"]
    PARSE --> CHUNKS["Semantic Chunks"]
    PARSE --> GROUND["Visual Grounding"]
    CHUNKS --> MD["Markdown Output"]
    CHUNKS --> SCHEMA["Schema Extraction"]
    GROUND --> SCHEMA
    SCHEMA --> OUTPUT["Structured Data"]
    OUTPUT --> VERIFY{"Confidence\\n> Threshold?"}
    VERIFY -->|Yes| AUTO["Automated Processing"]
    VERIFY -->|No| REVIEW["Human Review"]

    style DOC fill:#3b82f6,color:#fff
    style PARSE fill:#8b5cf6,color:#fff
    style OUTPUT fill:#22c55e,color:#fff
    style REVIEW fill:#eab308,color:#000`
    },

    keyTakeaways: [
      "Traditional OCR loses document structure; ADE preserves layout, tables, and visual relationships",
      "Visual grounding maps every extracted value to exact source coordinates for verification",
      "Use Pydantic schemas to define expected extraction structure with confidence scoring",
      "DPT-2 model understands document-specific patterns (tables, forms, charts) better than general VLMs",
      "Production pipelines need confidence thresholds to route uncertain extractions to human review",
      "Chunk-based output (markdown + structured) serves both RAG and automation use cases"
    ],

    resources: [
      {
        title: "LandingAI ADE Documentation",
        url: "https://docs.landing.ai",
        type: "docs",
        description: "Official API reference for Agentic Document Extraction"
      },
      {
        title: "LandingAI ADE Python SDK",
        url: "https://github.com/landing-ai/ade-python",
        type: "github",
        description: "Python library source code and examples"
      },
      {
        title: "DeepLearning.AI: Document AI Course",
        url: "https://www.deeplearning.ai/short-courses/document-ai-from-ocr-to-agentic-doc-extraction/",
        type: "course",
        description: "Free course covering OCR to ADE evolution"
      }
    ]
  },

  learn: {
    overview: {
      summary: "Master agentic document extraction with visual grounding, schema-driven extraction, and confidence-based routing for production document AI systems.",
      fullDescription: `Document AI has evolved through four distinct waves: traditional OCR (pattern matching), rule-based IDP (templates and regex), LLM-based extraction (GPT-4V, Claude), and now Agentic Document Extraction. Each wave solved problems but introduced new limitations. Traditional OCR loses structure. Rule-based systems break on format changes. LLMs hallucinate and cannot cite sources.

Agentic Document Extraction addresses these limitations through a fundamentally different approach. Rather than treating documents as images to describe or text to parse, ADE treats them as structured visual objects. The Document Pre-trained Transformer (DPT-2) is trained specifically on document layouts - tables with merged cells, multi-column text, forms with checkboxes, charts with data labels. This specialized training produces extractions that understand what a "Total" row in a table means, not just that there's text saying "Total."

The breakthrough capability is visual grounding. Every extracted value includes bounding box coordinates pointing to its exact location in the source document. When you extract a contract value of $1.5 million, the system can show you precisely where on page 7 that number appears. This traceability is transformative for compliance-heavy industries where audit trails are mandatory.

Building production document AI systems requires combining extraction with orchestration. An agentic workflow might parse a document, identify it as a contract, extract parties and dates, cross-reference against a database, flag missing signatures, and route to appropriate reviewers - all with confidence scoring at each step. This is where document AI meets the agent patterns from earlier in this course.`,
      prerequisites: ["Day 3: Building Agents from Scratch", "Day 24: Coding Agents & Sandboxed Execution", "Basic Python and Pydantic experience"],
      estimatedTime: "2-3 hours",
      difficulty: "intermediate"
    },

    concepts: [
      {
        title: "The Evolution from OCR to Agentic Document Extraction",
        description: `Document intelligence has progressed through four distinct waves, each solving problems while introducing new limitations.

Wave 1 (Traditional OCR, 1990s-2010s) converted images of text to machine-readable characters through pattern matching. Tesseract and ABBYY FineReader could recognize typed text but lost all document structure. A table became jumbled rows of text with no relationship between columns and values.

Wave 2 (Rule-Based IDP, 2010s) added templates and business rules on top of OCR. Systems like Kofax could extract specific fields from known document types using coordinate-based templates and regex patterns. The limitation: every new document format required manual template creation, and minor layout changes broke extraction.

Wave 3 (LLM-Based Extraction, 2022-2023) leveraged vision-language models like GPT-4V to describe documents and extract information without templates. This works surprisingly well for many documents but has critical limitations: hallucination risk (the model may invent data that looks plausible), no visual grounding (you cannot verify where extracted values came from), and context loss when documents are converted to text.

Wave 4 (Agentic Document Extraction, 2024+) combines vision-first understanding with structured extraction and visual grounding. Models like LandingAI's DPT-2 are trained specifically on document layouts. Every extraction maps to source coordinates. Confidence scores enable human-in-the-loop routing. The system can reason across multiple extraction steps, much like the coding agents from Day 24 iterate on code until it works.`,
        analogy: "Wave 1 is like transcribing a speech word-by-word. Wave 2 adds a template: 'The speaker's name is always in the first sentence.' Wave 3 watches the video and describes what happened. Wave 4 watches the video, understands the context, extracts specific facts, and can point to the exact timestamp where each fact was stated.",
        gotchas: [
          "ADE still uses OCR internally - it orchestrates multiple models, not replaces them",
          "Vision-language models alone (like GPT-4V) lack visual grounding capabilities",
          "Hallucination risk exists in any ML extraction - visual grounding mitigates but doesn't eliminate it"
        ]
      },
      {
        title: "Visual Grounding and Source Traceability",
        description: `Visual grounding is the key differentiator of agentic document extraction. Every extracted value maps back to exact document coordinates through bounding boxes.

A bounding box contains: page number, and normalized coordinates (x1, y1, x2, y2) representing the top-left and bottom-right corners as percentages of page dimensions. When you extract "vendor: Acme Corporation", the grounding data shows this came from page 1, coordinates (0.12, 0.08) to (0.35, 0.11).

This enables several critical capabilities. Verification: Users can click on any extracted value to see exactly where it came from in the original document. Audit trails: For compliance requirements (financial services, healthcare, legal), you can prove that extracted data matches source documents. Error diagnosis: When extraction fails or produces incorrect values, you can see what region the model was looking at. Human-in-the-loop: Reviewers can quickly verify low-confidence extractions by jumping directly to the source location.

To use grounding in practice, you render the original document page and overlay a highlight rectangle using the bounding box coordinates. Libraries like PyMuPDF (fitz) make this straightforward - convert normalized coordinates to page coordinates and add a highlight annotation.`,
        analogy: "Visual grounding is like citing your sources with page numbers and highlighted passages, not just saying 'I read it somewhere.' Academic papers require citations; enterprise document extraction requires visual grounding.",
        gotchas: [
          "Bounding boxes use normalized coordinates (0-1) - multiply by page dimensions to get pixels",
          "Multi-page documents require tracking page numbers alongside coordinates",
          "Rotated or skewed scans need preprocessing before coordinates align correctly"
        ]
      },
      {
        title: "Document Pre-trained Transformer (DPT) Architecture",
        description: `LandingAI's DPT-2 model is specifically trained on document layouts, unlike general-purpose vision-language models trained on natural images and web text.

The key insight is that documents have structure that natural images don't. A table has rows, columns, headers, and merged cells. A form has labels paired with input fields. A financial report has sections, subsections, and cross-referenced figures. DPT-2 learns these patterns from millions of documents.

Core capabilities include: Table extraction that handles gridless tables (where lines are implied by spacing), merged cells, and multi-row headers. Chart and graph data extraction that reads values from bar charts, line graphs, and pie charts. Reading order determination for multi-column layouts where left-to-right reading would interleave unrelated paragraphs. Form field detection that pairs labels with their corresponding values even when they're not adjacent.

The model outputs both markdown (preserving structure in a format LLMs can process) and structured chunks (programmatic access to individual elements). Each chunk has a type (header, paragraph, table, figure), text content, and grounding information.

Model selection matters: dpt-2-latest provides the best accuracy, while older versions may be faster but less capable. The API handles model selection automatically when you specify the model parameter.`,
        analogy: "A general VLM is like a tourist trying to read a foreign restaurant menu - they can describe what they see but may miss that the right column is prices. DPT-2 is like a native who also worked as a typesetter - it understands not just what the words say but how the layout conveys meaning.",
        gotchas: [
          "Complex nested tables (tables within tables) may require multiple extraction passes",
          "Handwritten text quality significantly affects accuracy - set lower confidence thresholds",
          "Very low resolution scans (under 100 DPI) challenge any document AI system"
        ]
      },
      {
        title: "Schema-Driven Extraction with Pydantic",
        description: `Schema-driven extraction replaces fragile regex patterns and template coordinates with semantic field definitions. You describe what you want to extract, and the model finds it.

The pattern uses Pydantic models to define your expected output structure. Each field has a name, type, and description. The description is critical - it guides the extraction model to understand what you mean by each field.

A well-designed schema for an invoice might include: vendor (str, "Company name that issued the invoice"), invoice_number (str, "Unique identifier for this invoice"), invoice_date (str, "Date the invoice was issued in YYYY-MM-DD format"), line_items (list[dict], "Individual items with description, quantity, and price"), total (float, "Final amount due including all taxes and fees").

The extraction process converts your Pydantic model to JSON schema, passes it with the parsed document content, and returns structured data matching your schema. Each field includes a confidence score indicating how certain the model is about the extraction.

Field descriptions make a significant difference in extraction quality. "total" alone is ambiguous - is it the subtotal, tax, or final amount? "Final amount due including all taxes and fees" is unambiguous. Invest time in writing clear descriptions.`,
        analogy: "Traditional extraction is like searching a document for the word 'total' and hoping you find the right one. Schema-driven extraction is like asking a human assistant 'What's the final amount this invoice says we owe?' - they understand context and find the right value.",
        gotchas: [
          "Field descriptions are prompts - vague descriptions produce inconsistent extractions",
          "Nested Pydantic models work but increase extraction complexity and potential for errors",
          "Optional fields need explicit handling - missing data should not crash your pipeline"
        ]
      },
      {
        title: "Chunk-Based Document Decomposition",
        description: `ADE doesn't process documents as flat text or raw images. It decomposes pages into semantic chunks, each representing a logical unit of content with its position and relationships preserved.

Chunk types include: headers (document and section titles), paragraphs (body text), tables (with their internal structure), figures (images, charts, diagrams), lists (bulleted or numbered items), and form fields (label-value pairs).

Each chunk contains: type classification, text content (the actual words), bounding box grounding (where it appears), and in some cases, internal structure (table rows and columns, list items).

This decomposition serves multiple purposes. For RAG applications, you can embed individual chunks rather than entire pages, improving retrieval precision. For targeted extraction, you can apply different schemas to different chunk types - extract financial metrics from tables, dates from headers, terms from paragraphs. For document understanding, the chunk hierarchy reveals document structure that flat text loses.

The parsed output includes both markdown (human-readable, good for LLM prompts) and the chunks array (programmatic, good for structured processing). Use markdown when feeding content to LLMs or storing for RAG. Use chunks when you need precise positional information or type-specific processing.`,
        analogy: "Flattening a document to text is like disassembling IKEA furniture and throwing away the instruction manual - you have all the pieces but no idea how they fit together. Chunk-based extraction keeps the assembly guide intact.",
        gotchas: [
          "Chunk granularity affects downstream processing - sometimes you want page-level, sometimes paragraph-level",
          "Tables spanning multiple pages are challenging - check for continuation markers",
          "Figures may contain text that's not in the chunk text (it's in the image) - use vision models for figure content"
        ]
      },
      {
        title: "Agentic Workflows: Multi-Step Document Reasoning",
        description: `For complex document tasks, a single extraction call isn't enough. Agentic workflows orchestrate multiple steps with reasoning between them, much like the coding agents from Day 24 iterate until they achieve their goal.

A contract review workflow might proceed as follows: Step 1: Parse document to markdown and chunks. Step 2: Classify document type (is this an NDA, MSA, SOW?). Step 3: Identify key sections (parties, term, compensation, termination clauses). Step 4: Extract structured data from each relevant section. Step 5: Cross-reference extracted data (do the party names match throughout?). Step 6: Flag issues (missing signatures, unusual terms, expired dates). Step 7: Generate summary with citations back to source locations.

Each step can use different techniques. Classification might use an LLM prompt. Section identification might use header chunk analysis. Extraction uses schema-based ADE. Cross-referencing uses code logic. Flagging uses business rules. Summary generation uses LLM with extracted facts.

The key insight from Day 3's agent loop applies here: observe (parse document), reason (what type is this, what should I extract), act (apply extraction), verify (check confidence, cross-reference). Low confidence or validation failures trigger iteration - perhaps re-extracting with different schema descriptions or flagging for human review.`,
        analogy: "A single extraction is like asking someone to fill out a form after glancing at a document. An agentic workflow is like giving them time to read the document, take notes, cross-reference sections, and then thoughtfully complete the form.",
        gotchas: [
          "Each agentic step adds latency and cost - balance thoroughness against performance requirements",
          "Errors in early steps propagate - classification mistakes lead to wrong extraction schemas",
          "State management between steps requires careful design - what context does each step need?"
        ]
      },
      {
        title: "Connectors and Batch Processing",
        description: `Production document AI systems rarely process one document at a time. They need to handle documents from various sources at scale: local directories, S3 buckets, Google Drive, email attachments, API uploads.

LandingAI provides connector abstractions for common sources. A local connector processes files from a directory path. Cloud connectors handle S3, GCS, and Azure Blob with credential configuration. The SDK handles authentication, pagination, and error recovery.

Batch processing patterns include: parallel processing with configurable concurrency (don't overwhelm the API), exponential backoff for rate limit handling, result persistence to JSON files or databases, progress tracking for long-running jobs, and partial failure handling (continue processing even if some documents fail).

A production batch job might: scan an S3 bucket for new PDFs, process them in batches of 10 with 3 concurrent workers, store results in a database with document ID and extraction data, move processed files to an 'archive' prefix, and alert on failures exceeding a threshold.

Memory management matters for large documents. PDFs with many pages or high-resolution scans consume significant memory. Process documents sequentially rather than loading all into memory. Stream results to storage rather than accumulating in lists.`,
        analogy: "Processing documents one at a time is like hand-washing dishes. Batch processing with connectors is like loading a dishwasher - you set it up once, add dishes as they come, and let it handle the work while you do something else.",
        gotchas: [
          "API rate limits vary by tier - build in rate limiting from the start",
          "Large documents (100+ pages) may timeout - consider splitting or increasing timeout settings",
          "Cloud connector credentials need secure management - use environment variables or secret managers"
        ]
      },
      {
        title: "Production Deployment Considerations",
        description: `Moving from prototype to production requires handling errors gracefully, monitoring extraction quality, implementing human-in-the-loop workflows, and optimizing costs.

Confidence thresholds determine routing. A threshold of 0.85 might route 80% of documents to full automation while flagging 20% for human review. The right threshold depends on your error tolerance - financial documents might require 0.95, while internal memos might accept 0.70.

Human-in-the-loop design matters. Reviewers should see: the original document with extracted regions highlighted, the extracted values with confidence scores, an easy way to correct errors and submit. Their corrections can become training signal for model improvement.

Cost optimization strategies include: batching documents during off-peak hours, caching parsed results for re-extraction with different schemas, using simpler models for classification before expensive extraction, and sampling for quality assurance rather than reviewing every document.

Monitoring should track: extraction latency (P50, P95, P99), confidence score distributions, human review rates, error rates by document type, and cost per document. Dashboards help identify degradation before it affects business outcomes.

Model versioning matters for reproducibility. Pinning to specific model versions ensures consistent extraction over time. When upgrading models, run parallel evaluation before switching production traffic.`,
        analogy: "A prototype is like cooking for yourself - if the pasta is slightly overcooked, you eat it anyway. Production is like running a restaurant - you need consistent quality, cost control, and a system for handling complaints.",
        gotchas: [
          "Model updates can change extraction behavior - test thoroughly before upgrading production",
          "Data residency requirements may dictate endpoint selection (US vs EU)",
          "HIPAA and SOC2 compliance requires specific configurations - consult documentation"
        ]
      }
    ],

    codeExamples: [
      {
        title: "Basic Document Parsing",
        language: "python",
        category: "basic",
        explanation: "Parse a PDF to markdown and semantic chunks - the foundation of all document AI workflows.",
        code: `"""LandingAI ADE: Basic Document Parsing"""

from pathlib import Path
from landingai_ade import LandingAIADE

# Initialize client (uses VISION_AGENT_API_KEY env var)
client = LandingAIADE()

# Parse a local PDF
response = client.parse(
    document=Path("invoice.pdf"),
    model="dpt-2-latest"
)

# Access markdown output (great for RAG pipelines)
print("=== Markdown Output ===")
print(response.markdown[:500])

# Access structured chunks with types and grounding
print("\\n=== Document Chunks ===")
for chunk in response.chunks:
    bbox = chunk.grounding.bounding_box
    print(f"Type: {chunk.type:10} | Page: {bbox.page} | "
          f"Position: ({bbox.x1:.2f}, {bbox.y1:.2f})")
    print(f"  Text: {chunk.text[:60]}...")
    print()

# Count chunks by type
from collections import Counter
type_counts = Counter(c.type for c in response.chunks)
print("=== Chunk Summary ===")
for chunk_type, count in type_counts.most_common():
    print(f"  {chunk_type}: {count}")`
      },
      {
        title: "Schema-Based Field Extraction",
        language: "python",
        category: "intermediate",
        explanation: "Extract specific fields using Pydantic schema with confidence scores for each field.",
        code: `"""Schema-Driven Document Extraction with Pydantic"""

from pathlib import Path
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema
from pydantic import BaseModel, Field
from typing import Optional

# Define extraction schema with detailed descriptions
class Invoice(BaseModel):
    vendor: str = Field(
        description="Company name that issued the invoice"
    )
    invoice_number: str = Field(
        description="Unique invoice identifier or number"
    )
    invoice_date: str = Field(
        description="Date invoice was issued (any format)"
    )
    line_items: list[dict] = Field(
        description="List of items with description, quantity, and amount"
    )
    subtotal: Optional[float] = Field(
        default=None,
        description="Subtotal before tax (if shown)"
    )
    tax: Optional[float] = Field(
        default=None,
        description="Tax amount (if applicable)"
    )
    total: float = Field(
        description="Final total amount due"
    )

# Initialize and parse
client = LandingAIADE()
parsed = client.parse(
    document=Path("invoice.pdf"),
    model="dpt-2-latest"
)

# Extract structured fields
extraction = client.extract(
    schema=pydantic_to_json_schema(Invoice),
    markdown=parsed.markdown
)

# Access the extracted data
invoice = extraction.data
print(f"Vendor: {invoice.vendor}")
print(f"Invoice #: {invoice.invoice_number}")
print(f"Date: {invoice.invoice_date}")
print(f"Total: \${invoice.total:,.2f}")

if invoice.line_items:
    print(f"\\nLine Items ({len(invoice.line_items)}):")
    for item in invoice.line_items:
        print(f"  - {item}")

# Check confidence scores
print("\\n=== Confidence Scores ===")
for field_name, meta in extraction.metadata.items():
    confidence = meta.confidence
    status = "OK" if confidence > 0.85 else "REVIEW" if confidence > 0.7 else "LOW"
    print(f"  {field_name:15} {confidence:.2f} [{status}]")`
      },
      {
        title: "Visual Grounding and Verification",
        language: "python",
        category: "intermediate",
        explanation: "Use bounding boxes to create verifiable extractions with visual citations.",
        code: `"""Visual Grounding: Traceable Document Extraction"""

from pathlib import Path
from landingai_ade import LandingAIADE
import fitz  # PyMuPDF - pip install pymupdf

client = LandingAIADE()

# Parse with grounding information
response = client.parse(
    document=Path("financial_report.pdf"),
    model="dpt-2-latest"
)

# Find all table chunks
table_chunks = [c for c in response.chunks if c.type == "table"]
print(f"Found {len(table_chunks)} tables\\n")

for i, table in enumerate(table_chunks):
    bbox = table.grounding.bounding_box
    print(f"Table {i+1}:")
    print(f"  Page: {bbox.page}")
    print(f"  Coords: ({bbox.x1:.3f}, {bbox.y1:.3f}) to ({bbox.x2:.3f}, {bbox.y2:.3f})")
    print(f"  Preview: {table.text[:80]}...")
    print()


def highlight_extraction(pdf_path: str, chunk, output_path: str):
    """
    Render PDF page with highlighted extraction region.
    Creates a visual citation for the extracted data.
    """
    doc = fitz.open(pdf_path)
    bbox = chunk.grounding.bounding_box
    page = doc[bbox.page - 1]  # Pages are 0-indexed in PyMuPDF

    # Convert normalized coords (0-1) to page coordinates
    rect = page.rect
    highlight_rect = fitz.Rect(
        bbox.x1 * rect.width,
        bbox.y1 * rect.height,
        bbox.x2 * rect.width,
        bbox.y2 * rect.height
    )

    # Add highlight annotation
    annot = page.add_highlight_annot(highlight_rect)
    annot.set_colors(stroke=(1, 0.8, 0))  # Yellow highlight
    annot.update()

    # Render to image
    pix = page.get_pixmap(dpi=150)
    pix.save(output_path)
    print(f"Saved highlighted page to {output_path}")

    doc.close()


# Create visual citation for first table
if table_chunks:
    highlight_extraction(
        "financial_report.pdf",
        table_chunks[0],
        "table_citation.png"
    )`
      },
      {
        title: "Production Pipeline with Confidence Routing",
        language: "python",
        category: "advanced",
        explanation: "Full production pipeline with batch processing, error handling, and human-in-the-loop routing.",
        code: `"""Production Agentic Document Pipeline"""

from pathlib import Path
from dataclasses import dataclass, field
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema
from pydantic import BaseModel, Field as PydanticField
from typing import Optional
import logging
import json
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)
logger = logging.getLogger(__name__)


# Extraction schema
class InvoiceData(BaseModel):
    vendor: str = PydanticField(description="Vendor company name")
    invoice_number: str = PydanticField(description="Invoice ID")
    invoice_date: str = PydanticField(description="Invoice date")
    total: float = PydanticField(description="Total amount due")


@dataclass
class ExtractionResult:
    """Result of processing a single document."""
    file: str
    success: bool
    data: Optional[dict] = None
    confidence: float = 0.0
    needs_review: bool = False
    error: Optional[str] = None
    processed_at: str = field(
        default_factory=lambda: datetime.now().isoformat()
    )


class DocumentProcessor:
    """Production document extraction with confidence routing."""

    def __init__(
        self,
        confidence_threshold: float = 0.85,
        review_threshold: float = 0.70
    ):
        self.client = LandingAIADE()
        self.schema = pydantic_to_json_schema(InvoiceData)
        self.conf_threshold = confidence_threshold
        self.review_threshold = review_threshold

    def process_document(self, file_path: Path) -> ExtractionResult:
        """Process single document with error handling."""
        try:
            # Step 1: Parse document
            logger.info(f"Parsing {file_path.name}...")
            parsed = self.client.parse(
                document=file_path,
                model="dpt-2-latest"
            )

            if not parsed.markdown or len(parsed.markdown) < 50:
                return ExtractionResult(
                    file=str(file_path),
                    success=False,
                    error="Document appears empty or unreadable",
                    needs_review=True
                )

            # Step 2: Extract structured data
            logger.info(f"Extracting fields from {file_path.name}...")
            extraction = self.client.extract(
                schema=self.schema,
                markdown=parsed.markdown
            )

            # Step 3: Calculate overall confidence
            confidences = [
                m.confidence
                for m in extraction.metadata.values()
            ]
            avg_confidence = (
                sum(confidences) / len(confidences)
                if confidences else 0
            )

            # Step 4: Route based on confidence
            if avg_confidence >= self.conf_threshold:
                needs_review = False
                logger.info(
                    f"{file_path.name}: AUTO ({avg_confidence:.2f})"
                )
            elif avg_confidence >= self.review_threshold:
                needs_review = True
                logger.warning(
                    f"{file_path.name}: REVIEW ({avg_confidence:.2f})"
                )
            else:
                needs_review = True
                logger.warning(
                    f"{file_path.name}: LOW CONF ({avg_confidence:.2f})"
                )

            return ExtractionResult(
                file=str(file_path),
                success=True,
                data=extraction.data.model_dump(),
                confidence=avg_confidence,
                needs_review=needs_review
            )

        except Exception as e:
            logger.error(f"Error processing {file_path.name}: {e}")
            return ExtractionResult(
                file=str(file_path),
                success=False,
                error=str(e),
                needs_review=True
            )

    def process_batch(
        self,
        directory: Path,
        output_file: Optional[Path] = None
    ) -> list[ExtractionResult]:
        """Process all PDFs in directory."""
        results = []
        pdf_files = sorted(directory.glob("*.pdf"))

        logger.info(f"Processing {len(pdf_files)} documents...")

        for i, pdf_file in enumerate(pdf_files, 1):
            logger.info(f"[{i}/{len(pdf_files)}] {pdf_file.name}")
            result = self.process_document(pdf_file)
            results.append(result)

        # Save results if output file specified
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(
                    [r.__dict__ for r in results],
                    f,
                    indent=2
                )
            logger.info(f"Results saved to {output_file}")

        return results


# Usage example
if __name__ == "__main__":
    processor = DocumentProcessor(
        confidence_threshold=0.85,
        review_threshold=0.70
    )

    results = processor.process_batch(
        directory=Path("./invoices"),
        output_file=Path("./extraction_results.json")
    )

    # Summary statistics
    auto = [r for r in results if r.success and not r.needs_review]
    review = [r for r in results if r.success and r.needs_review]
    failed = [r for r in results if not r.success]

    print(f"\\n{'='*50}")
    print(f"PROCESSING SUMMARY")
    print(f"{'='*50}")
    print(f"Auto-processed:  {len(auto):4} documents")
    print(f"Needs review:    {len(review):4} documents")
    print(f"Failed:          {len(failed):4} documents")
    print(f"{'='*50}")`
      }
    ],

    diagrams: [
      {
        title: "OCR vs Agentic Extraction Architecture",
        type: "mermaid",
        mermaid: `flowchart TD
    subgraph Traditional["Traditional OCR Pipeline"]
        T_DOC["Document"] --> T_OCR["OCR Engine"]
        T_OCR --> T_TEXT["Raw Text"]
        T_TEXT --> T_LLM["LLM Extraction"]
        T_LLM --> T_OUT["Output"]
        T_TEXT -.->|"Lost"| T_LOST["Layout\\nTables\\nCharts"]
    end

    subgraph Agentic["Agentic Document Extraction"]
        A_DOC["Document"] --> A_DPT["DPT-2 Model"]
        A_DPT --> A_CHUNKS["Semantic Chunks"]
        A_DPT --> A_GROUND["Visual Grounding"]
        A_CHUNKS --> A_SCHEMA["Schema Extraction"]
        A_GROUND --> A_SCHEMA
        A_SCHEMA --> A_OUT["Structured Output\\n+ Citations"]
    end

    style T_LOST fill:#ef4444,color:#fff
    style A_OUT fill:#22c55e,color:#fff`,
        caption: "Traditional OCR loses document structure, while ADE preserves layout and provides visual grounding."
      },
      {
        title: "Agentic Document Processing Workflow",
        type: "mermaid",
        mermaid: `flowchart TD
    INPUT["Document Input"] --> PARSE["Parse with DPT-2"]
    PARSE --> ANALYZE["Analyze Structure"]
    ANALYZE --> CLASSIFY{"Document\\nType?"}

    CLASSIFY -->|Invoice| INV_SCHEMA["Invoice Schema"]
    CLASSIFY -->|Contract| CON_SCHEMA["Contract Schema"]
    CLASSIFY -->|Receipt| REC_SCHEMA["Receipt Schema"]

    INV_SCHEMA --> EXTRACT["Extract Fields"]
    CON_SCHEMA --> EXTRACT
    REC_SCHEMA --> EXTRACT

    EXTRACT --> VALIDATE{"Confidence\\n> 85%?"}
    VALIDATE -->|Yes| AUTO["Auto-Process"]
    VALIDATE -->|No| REVIEW["Human Review"]

    AUTO --> STORE["Store Results"]
    REVIEW --> CORRECT["Correct & Approve"]
    CORRECT --> STORE

    style PARSE fill:#8b5cf6,color:#fff
    style AUTO fill:#22c55e,color:#fff
    style REVIEW fill:#eab308,color:#000`,
        caption: "Document classification routes to appropriate extraction schemas with confidence-based human review."
      },
      {
        title: "Visual Grounding Data Flow",
        type: "mermaid",
        mermaid: `flowchart LR
    subgraph Source["Source Document"]
        PAGE["PDF Page"]
        REGION["Data Region"]
    end

    subgraph Extraction["ADE Output"]
        VALUE["Extracted Value"]
        BBOX["Bounding Box\\n(x1,y1,x2,y2,page)"]
        CONF["Confidence: 0.96"]
    end

    subgraph Verification["Verification UI"]
        DISPLAY["Document Viewer"]
        HIGHLIGHT["Highlighted Region"]
        CITE["Source Citation"]
    end

    PAGE --> VALUE
    REGION --> BBOX
    REGION --> CONF

    VALUE --> DISPLAY
    BBOX --> HIGHLIGHT
    CONF --> CITE

    CITE --> USER["User Verifies"]

    style BBOX fill:#3b82f6,color:#fff
    style HIGHLIGHT fill:#22c55e,color:#fff`,
        caption: "Every extracted value maps to source coordinates, enabling click-to-verify workflows."
      }
    ],

    keyTakeaways: [
      "Document AI has evolved through four waves: OCR, rule-based IDP, LLM extraction, and agentic extraction",
      "Visual grounding provides audit trails by mapping every value to exact source coordinates",
      "DPT-2 is trained specifically on document layouts, outperforming general vision models on tables and forms",
      "Schema-driven extraction uses Pydantic models with descriptive field definitions",
      "Chunk-based decomposition preserves document structure for RAG and targeted extraction",
      "Production systems need confidence thresholds to route low-certainty extractions to human review",
      "Agentic workflows orchestrate multiple extraction steps with reasoning between them",
      "Batch processing requires rate limiting, error handling, and result persistence",
      "Model versioning ensures reproducible extractions - test before upgrading production",
      "Visual grounding enables click-to-verify interfaces that accelerate human review"
    ],

    resources: [
      {
        title: "LandingAI ADE Documentation",
        url: "https://docs.landing.ai",
        type: "docs",
        description: "Official API reference for Agentic Document Extraction"
      },
      {
        title: "LandingAI ADE Python SDK",
        url: "https://github.com/landing-ai/ade-python",
        type: "github",
        description: "Python library source code and examples"
      },
      {
        title: "DeepLearning.AI: Document AI Course",
        url: "https://www.deeplearning.ai/short-courses/document-ai-from-ocr-to-agentic-doc-extraction/",
        type: "course",
        description: "Free short course covering OCR to ADE evolution, taught by LandingAI engineers"
      },
      {
        title: "LandingAI Blog: OCR to Agentic Extraction",
        url: "https://landing.ai/blog/ocr-to-agentic-document-extraction-a-look-into-the-evolution-of-document-intelligence",
        type: "article",
        description: "Detailed overview of the four waves of document intelligence"
      },
      {
        title: "LlamaIndex: Agentic OCR Guide",
        url: "https://www.llamaindex.ai/blog/agentic-ocr",
        type: "article",
        description: "Complementary perspective on agentic document processing patterns"
      },
      {
        title: "PyMuPDF Documentation",
        url: "https://pymupdf.readthedocs.io/",
        type: "docs",
        description: "PDF manipulation library for rendering highlights and annotations"
      }
    ],

    faq: [
      {
        question: "How is ADE different from just sending a document screenshot to GPT-4o?",
        answer: "GPT-4o can describe documents but lacks visual grounding - you cannot verify where data came from. ADE provides exact coordinates for each extraction, enabling audit trails. Additionally, DPT-2 is specifically trained on document layouts and achieves higher accuracy on tables, forms, and complex structures than general-purpose vision models."
      },
      {
        question: "What document formats does LandingAI ADE support?",
        answer: "ADE supports PDF files of any length (automatically split into pages), images (PNG, JPEG, TIFF), URLs pointing to documents, and raw bytes. The Python SDK handles format detection automatically. For multi-page PDFs, pages are processed in parallel for efficiency."
      },
      {
        question: "How do I handle low-confidence extractions in production?",
        answer: "Implement confidence-based routing: check the confidence score for each field, set a threshold (e.g., 0.85 for automation, 0.70 for review), and route low-confidence results to a human review queue. Store grounding data so reviewers can quickly verify by clicking through to the source location in the document."
      },
      {
        question: "Can ADE handle handwritten documents?",
        answer: "DPT-2 can process handwritten text, but accuracy depends on legibility. For critical handwritten fields, set lower confidence thresholds and expect more human review. Very messy handwriting or low-resolution scans (under 100 DPI) will challenge any document AI system."
      },
      {
        question: "How does pricing work for LandingAI ADE?",
        answer: "Pricing is per-page processed, with volume discounts available. The API has rate limits that vary by subscription tier. For batch processing, the SDK handles rate limiting and retries automatically. Check landing.ai for current pricing and tier details."
      },
      {
        question: "Can I use ADE for documents in languages other than English?",
        answer: "DPT-2 supports multilingual documents and was trained on documents in many languages. Accuracy may vary by language and script - Latin-based languages currently have the highest accuracy. Test with representative samples from your target languages before production deployment."
      }
    ],

    applications: [
      {
        title: "Invoice Processing Automation",
        description: "Extract vendor, amounts, line items, and payment terms from incoming invoices. Auto-match to purchase orders and route for approval. Flag discrepancies for human review based on confidence scores and business rules."
      },
      {
        title: "Contract Analysis and Clause Extraction",
        description: "Identify key terms, dates, parties, and obligations from legal contracts. Track expiration dates and renewal windows. Enable semantic search across contract corpus using extracted metadata and full-text content."
      },
      {
        title: "Medical Records Processing",
        description: "Extract patient information, diagnoses, medications, and treatment notes from clinical documents. Preserve source citations for audit and compliance. Route low-confidence extractions to clinical staff for verification."
      },
      {
        title: "Financial Statement Analysis",
        description: "Parse earnings reports, balance sheets, and SEC filings. Extract tables with proper column and row associations intact. Feed structured financial data to valuation models and analysis pipelines."
      },
      {
        title: "Insurance Claims Processing",
        description: "Extract claim details from submitted documentation including forms, receipts, and supporting evidence. Cross-reference against policy documents. Auto-adjudicate simple claims while routing complex cases to adjusters."
      }
    ],

    relatedDays: [3, 11, 23, 24]
  }
};
