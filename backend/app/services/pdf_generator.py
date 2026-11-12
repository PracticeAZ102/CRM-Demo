import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
from reportlab.pdfgen import canvas

from app.models.quotation import Quotation, Enquiry
from app.models.equipment_model import EquipmentModel

class NumberedCanvas(canvas.Canvas):
    """Adds formal running footer with page numbers and corporate notice"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7a8794"))
        
        # Footer line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 40, 555, 40)
        
        # Footer text
        footer_text = "ATCORP – India | Head Office: Sector 62, Noida (NCR) | www.atcorpindia.com | sales@atcorpindia.com"
        self.drawString(40, 28, footer_text)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 28, page_str)
        self.restoreState()


def generate_quotation_pdf(quote: Quotation, enquiry: Enquiry, model: EquipmentModel) -> io.BytesIO:
    """
    Generates a formal 3-page ATCORP engineering proposal:
    Page 1: Commercial Offer Letter & Price Breakdown
    Page 2: Technical Specifications & Operating Envelope
    Page 3: General Arrangement (GA) Dimensional Blueprint
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_title_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#2986cc")
    )
    brand_sub_style = ParagraphStyle(
        'BrandSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#475569")
    )
    doc_title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#000000"),
        alignment=1 # Center
    )
    body_bold = ParagraphStyle('BodyBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12)
    body_text = ParagraphStyle('BodyText', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12)
    small_text = ParagraphStyle('SmallText', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor("#475569"))
    th_style = ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.white)
    td_style = ParagraphStyle('TD', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11)
    td_bold = ParagraphStyle('TDBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11)

    story = []

    # =========================================================================
    # PAGE 1: COMMERCIAL PROPOSAL
    # =========================================================================
    
    # 1. Header with ATCORP Branding
    header_data = [
        [
            Paragraph("<b>ATCORP – INDIA</b>", brand_title_style),
            Paragraph("<b>Ref No:</b> " + quote.quote_number + "<br/>" +
                      "<b>Rev:</b> Rev-0" + str(quote.revision_no) + "<br/>" +
                      "<b>Date:</b> " + datetime.now().strftime("%d-%b-%Y") + "<br/>" +
                      "<b>Validity:</b> " + str(quote.validity_days) + " Days", body_text)
        ],
        [
            Paragraph("<b>Total Compressed Air & Process Cooling Solutions</b><br/>" +
                      "Corporate Office: B-48, Sector 62, Noida, Gautam Buddha Nagar, UP 201309<br/>" +
                      "Regional Branches: Haridwar | Rudrapur | Lucknow | Chandigarh<br/>" +
                      "GSTIN: 09AABCA9124K1Z5 | Web: www.atcorpindia.com", brand_sub_style),
            ""
        ]
    ]
    header_table = Table(header_data, colWidths=[330, 185])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('SPAN', (0,1), (1,1)),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2986cc"), spaceBefore=6, spaceAfter=10))

    # 2. Addressee Info
    client_data = [
        [
            Paragraph("<b>TO:</b><br/>" +
                      f"<b>{enquiry.company_name}</b><br/>" +
                      f"Attn: {enquiry.contact_person} ({enquiry.designation})<br/>" +
                      f"Site: {enquiry.plant_location}<br/>" +
                      f"Phone: {enquiry.phone} | Email: {enquiry.email}<br/>" +
                      f"GSTIN: {enquiry.gstin or 'Not Provided'}", body_text),
            Paragraph("<b>OFFICIAL SALES EXECUTION OFFER</b><br/>" +
                      f"<b>Enquiry Ref:</b> ENQ-{enquiry.id}<br/>" +
                      f"<b>Territory Branch:</b> {enquiry.branch_region}<br/>" +
                      f"<b>Sales Engineer:</b> {enquiry.assigned_engineer}<br/>" +
                      f"<b>Industry Vertical:</b> {enquiry.industry_sector}", body_text)
        ]
    ]
    client_table = Table(client_data, colWidths=[315, 200])
    client_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(client_table)
    story.append(Spacer(1, 10))

    # 3. Subject
    subject_text = f"<b>SUBJECT:</b> Techno-Commercial Offer for <b>{model.idesc}</b> (Model SKU: <b>{model.prkey}</b>)"
    story.append(Paragraph(subject_text, body_text))
    story.append(Spacer(1, 10))

    # 4. Commercial Price Schedule Table
    th_bg = colors.HexColor("#2986cc")
    price_table_data = [
        [
            Paragraph("Sr.", th_style),
            Paragraph("Item Description & SKU", th_style),
            Paragraph("Qty", th_style),
            Paragraph("List Price (₹)", th_style),
            Paragraph("Disc %", th_style),
            Paragraph("Net Taxable (₹)", th_style),
        ],
        [
            Paragraph("1", td_style),
            Paragraph(f"<b>{model.idesc}</b><br/><font color='#475569'>Brand: {model.brand} | Motor: {model.motor} | VSD/FS: {model.vsd_fs}</font>", td_style),
            Paragraph(f"{quote.quantity} No.", td_style),
            Paragraph(f"₹{quote.base_clp:,.0f}", td_style),
            Paragraph(f"{quote.discount_pct:.1f}%", td_style),
            Paragraph(f"₹{(quote.base_clp - quote.discount_amount):,.0f}", td_bold),
        ],
        [
            "",
            Paragraph("Packaging & Forwarding Charges (P&F @ " + f"{quote.packaging_pct:.1f}%)", td_style),
            "-", "-", "-",
            Paragraph(f"₹{quote.packaging_amount:,.0f}", td_style),
        ],
        [
            "",
            Paragraph(f"Freight & Transit Insurance ({quote.freight_terms})", td_style),
            "-", "-", "-",
            Paragraph(f"₹{quote.freight_amount:,.0f}", td_style),
        ],
        [
            "",
            Paragraph("Erection, Commissioning & Operator Training", td_style),
            "-", "-", "-",
            Paragraph(f"₹{quote.installation_charges:,.0f}", td_style),
        ],
        [
            "",
            Paragraph("<b>TOTAL TAXABLE VALUE</b>", td_bold),
            "", "", "",
            Paragraph(f"<b>₹{quote.taxable_value:,.0f}</b>", td_bold),
        ],
        [
            "",
            Paragraph(f"Goods & Services Tax (GST @ {quote.gst_rate:.0f}% - {quote.gst_type})", td_style),
            "", "", "",
            Paragraph(f"₹{quote.gst_amount:,.0f}", td_style),
        ],
        [
            "",
            Paragraph("<b>NET PROPOSAL VALUE (FOR SITE INCL. TAXES)</b>", body_bold),
            "", "", "",
            Paragraph(f"<b>₹{quote.total_value:,.0f}</b>", body_bold),
        ]
    ]

    price_table = Table(price_table_data, colWidths=[25, 230, 45, 75, 45, 95])
    price_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), th_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (2,0), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,5), (-1,5), colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (0,7), (-1,7), colors.HexColor("#e0f2fe")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(price_table)
    story.append(Spacer(1, 10))

    # 5. Terms & Signatory
    terms_data = [
        [
            Paragraph("<b>COMMERCIAL TERMS & CONDITIONS:</b><br/>" +
                      f"• <b>Payment:</b> {quote.payment_terms}<br/>" +
                      f"• <b>Delivery Period:</b> {quote.delivery_weeks}<br/>" +
                      f"• <b>Price Basis:</b> {quote.freight_terms}<br/>" +
                      f"• <b>Warranty:</b> {quote.warranty_months} Months from commissioning or 18 months from supply<br/>" +
                      "• <b>Statutory:</b> Taxes charged as per prevalent GST council rates.<br/>" +
                      "• <b>GA Clearance:</b> Machine manufacturing commences upon GA blueprint signoff.", small_text),
            Paragraph("<b>FOR ATCORP – INDIA</b><br/><br/><br/>" +
                      "<b>Authorized Signatory</b><br/>" +
                      f"<font color='#475569'>{quote.enquiry.assigned_engineer or 'Regional Head'}<br/>ATCORP North Zone HQ</font>", body_text)
        ]
    ]
    terms_table = Table(terms_data, colWidths=[360, 155])
    terms_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (0,0), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(terms_table)

    # =========================================================================
    # PAGE 2: TECHNICAL SPECIFICATION DATA SHEET
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("<b>ANNEXURE I: TECHNICAL SPECIFICATION DATA SHEET</b>", doc_title_style))
    story.append(Paragraph(f"<font color='#475569'>Equipment Model: <b>{model.prkey}</b> | Brand: <b>{model.brand}</b></font>", small_text))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2986cc"), spaceBefore=4, spaceAfter=12))

    tech_specs_data = [
        [Paragraph("Parameter / Specification", th_style), Paragraph("Design Value & Engineering Rating", th_style)],
        [Paragraph("Product Model Code (PRKEY)", td_bold), Paragraph(model.prkey, td_style)],
        [Paragraph("Full Equipment Nomenclature", td_bold), Paragraph(model.idesc, td_style)],
        [Paragraph("OEM Brand & Manufacturer", td_bold), Paragraph(f"{model.brand} (Authorized Distribution & Service by ATCORP)", td_style)],
        [Paragraph("Equipment Category / Type", td_bold), Paragraph(model.type, td_style)],
        [Paragraph("Drive Transmission Type", td_bold), Paragraph(f"<b>{model.vsd_fs}</b> (Inverter Variable Speed / Fixed Speed)", td_style)],
        [Paragraph("Main Electric Motor Rating", td_bold), Paragraph(model.motor, td_style)],
        [Paragraph("Maximum Working Pressure", td_bold), Paragraph(model.maximum_pressure, td_style)],
        [Paragraph("Free Air Delivery (FAD Flow)", td_bold), Paragraph(model.fad_cfm, td_style)],
        [Paragraph("Overall Machine Footprint (Dimension)", td_bold), Paragraph(model.dimension, td_style)],
        [Paragraph("Power Supply Requirements", td_bold), Paragraph("415 V ± 10%, 3 Phase, 50 Hz AC Standard Industrial", td_style)],
        [Paragraph("Operating Ambient Temp Range", td_bold), Paragraph("0°C to +46°C Continuous Tropical Duty Envelope", td_style)],
        [Paragraph("Sound Pressure Level", td_bold), Paragraph("68 ± 3 dB(A) Canopy Encased Acoustic Enclosure", td_style)],
        [Paragraph("Quality Compliance Standards", td_bold), Paragraph("ISO 1217 Annex C / IS 10431 / CE Compliant", td_style)],
        [Paragraph("Standard Protective Controls", td_bold), Paragraph("High Air Temp (HAT) cut-off, Motor overload relay, Phase reversal protection", td_style)],
    ]
    tech_table = Table(tech_specs_data, colWidths=[200, 315])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), th_bg),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # Scope of Supply & Utility connection callouts
    story.append(Paragraph("<b>STANDARD SCOPE OF SUPPLY:</b>", body_bold))
    scope_text = """
    1. Complete factory assembled, piped and wired rotary compressor / industrial chiller package ready for hook-up.<br/>
    2. Air-cooled / water-cooled heat exchangers with integrated centrifugal moisture separator and zero-loss auto drain.<br/>
    3. Microprocessor control panel with graphic LCD display, pressure/temp readouts, and maintenance hour countdown timer.<br/>
    4. First fill of synthetic high-grade lubricant with 4,000 service hours rating.<br/>
    5. Structural steel base frame with built-in anti-vibration mountings (no special foundation required).
    """
    story.append(Paragraph(scope_text, small_text))

    # =========================================================================
    # PAGE 3: GENERAL ARRANGEMENT (GA) BLUEPRINT & DIMENSIONAL DRAWING
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("<b>ANNEXURE II: GENERAL ARRANGEMENT (GA) BLUEPRINT</b>", doc_title_style))
    story.append(Paragraph(f"<font color='#475569'>Blueprint Reference: <b>{quote.ga_drawing_id}</b> | Model: <b>{model.prkey}</b></font>", small_text))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2986cc"), spaceBefore=4, spaceAfter=14))

    # Schematic visual table representing GA Blueprint
    blueprint_data = [
        [Paragraph("<b>CERTIFIED DIMENSIONAL BLUEPRINT LAYOUT</b>", body_bold)],
        [Paragraph(f"""
        <font size="8" color="#475569">
        ========================================================================================<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>TOP / PLAN VIEW</b><br/>
        &nbsp;&nbsp;┌──────────────────────────────────────────────────────────┐&nbsp;&nbsp;◄── <b>Length:</b> {model.dimension.split('x')[0] if 'x' in model.dimension else '1200 mm'}<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;[ AIR DISCHARGE 1.5\" BSP ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;▲<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ COMPRESSOR AIREND / MOTOR ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;│ <b>Width:</b> {model.dimension.split('x')[1] if 'x' in model.dimension else '850 mm'}<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;▼<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;[ POWER CABLE INLET ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ PLC CONTROLLER ]&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
        &nbsp;&nbsp;└──────────────────────────────────────────────────────────┘<br/>
        <br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>FRONT ELEVATION VIEW</b><br/>
        &nbsp;&nbsp;┌──────────────────────────────────────────────────────────┐&nbsp;&nbsp;▲<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;┌───────────────┐&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────┐&nbsp;&nbsp;│&nbsp;&nbsp;│<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;│ COOLING FAN&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ LCD DISPLAY&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;│ <b>Height:</b> {model.dimension.split('x')[2] if 'x' in model.dimension else '1350 mm'}<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;│ EXHAUST GRILL │&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ CONTROLLER&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;│<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;└───────────────┘&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────────┘&nbsp;&nbsp;│&nbsp;&nbsp;▼<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
        &nbsp;&nbsp;│&nbsp;&nbsp;[ FORKLIFT POCKETS ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ FORKLIFT POCKETS ]&nbsp;&nbsp;│<br/>
        &nbsp;&nbsp;└──[===]─────────────────────────────────────────[===]─────┘<br/>
        ========================================================================================
        </font>
        """, body_text)],
        [Paragraph(f"""
        <b>FOUNDATION & INSTALLATION CLEARANCES:</b><br/>
        • Minimum 1,000 mm service clearance required on all 4 sides for filter maintenance and air circulation.<br/>
        • Machine net weight: Approx. 480 kg. Flat industrial concrete floor (150 mm thickness) is sufficient.<br/>
        • Air Outlet Connection: 1.5 inch BSP Female.<br/>
        • Condensate Drain: 1/2 inch Polyurethane tubing lead to oil-water separator.
        """, small_text)]
    ]

    blueprint_table = Table(blueprint_data, colWidths=[515])
    blueprint_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#2986cc")),
        ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#2986cc")),
        ('LINEBELOW', (0,1), (-1,1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(blueprint_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer

