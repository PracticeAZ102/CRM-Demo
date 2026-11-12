import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from app.models.ofm import OFMRecord
from app.models.quotation import Quotation, Enquiry
from app.models.equipment_model import EquipmentModel

def generate_factory_job_card_pdf(ofm: OFMRecord, enquiry: Enquiry, quote: Quotation, model: EquipmentModel) -> io.BytesIO:
    """
    Generates a formal 1-page Manufacturing PPC Job Release Card & Frozen OFM Sheet:
    Contains all locked factory specifications, verified customer PO details, and committed dispatch schedule.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=35,
        leftMargin=35,
        topMargin=35,
        bottomMargin=35
    )

    styles = getSampleStyleSheet()

    header_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#2986cc")
    )
    banner_style = ParagraphStyle(
        'Banner',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.white,
        alignment=1
    )
    body_bold = ParagraphStyle('BodyBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11)
    body_text = ParagraphStyle('BodyText', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11)
    small_text = ParagraphStyle('SmallText', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=colors.HexColor("#475569"))
    th_style = ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.white)
    td_style = ParagraphStyle('TD', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10)
    td_bold = ParagraphStyle('TDBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10)

    story = []

    # 1. Company Header
    header_data = [
        [
            Paragraph("<b>ATCORP – INDIA</b><br/><font size='8' color='#475569'>Central Manufacturing & Plant Assembly Division | Sector 62, Noida HQ</font>", header_style),
            Paragraph(f"<b>OFM No:</b> {ofm.ofm_number}<br/><b>Revision:</b> Rev-0{ofm.revision_no}<br/><b>Released:</b> {datetime.now().strftime('%d-%b-%Y')}", body_text)
        ]
    ]
    header_table = Table(header_data, colWidths=[350, 175])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    story.append(header_table)
    story.append(Spacer(1, 6))

    # 2. Release Banner
    status_bg = colors.HexColor("#166534") if ofm.is_frozen else colors.HexColor("#b45309")
    banner_title = "ORDER FINALIZATION MEMORANDUM (OFM) — OFFICIAL PPC FACTORY RELEASE" if ofm.is_frozen else "ORDER FINALIZATION MEMORANDUM (OFM) — PENDING PO SCRUTINY"
    banner_table = Table([[Paragraph(f"<b>{banner_title}</b>", banner_style)]], colWidths=[525])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), status_bg),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 8))

    # 3. Customer & PO Verification Grid
    po_data = [
        [
            Paragraph("<b>CUSTOMER / CLIENT DETAILS</b>", body_bold),
            Paragraph("<b>PURCHASE ORDER (PO) VERIFICATION GATE</b>", body_bold)
        ],
        [
            Paragraph(f"<b>Company:</b> {enquiry.company_name}<br/>" +
                      f"<b>Site:</b> {enquiry.plant_location}<br/>" +
                      f"<b>Contact:</b> {enquiry.contact_person} ({enquiry.phone})<br/>" +
                      f"<b>GSTIN:</b> {enquiry.gstin or 'Not Provided'}<br/>" +
                      f"<b>Enquiry ID:</b> ENQ-{enquiry.id}", body_text),
            Paragraph(f"<b>Customer PO No:</b> <b>{ofm.customer_po_number or 'Awaiting Formal PO'}</b><br/>" +
                      f"<b>Customer PO Date:</b> {ofm.customer_po_date or 'N/A'}<br/>" +
                      f"<b>Verified PO Value:</b> ₹{(ofm.customer_po_value or quote.total_value):,.0f} (Incl. Taxes)<br/>" +
                      f"<b>PO Scrutiny Status:</b> <font color='{'#166534' if ofm.is_frozen else '#b45309'}'><b>{'CLEARED & FROZEN' if ofm.is_frozen else 'PENDING VERIFICATION'}</b></font><br/>" +
                      f"<b>Approved By:</b> {ofm.frozen_by or 'Rajesh Sharma (Admin)'}", body_text)
        ]
    ]
    po_table = Table(po_data, colWidths=[262, 263])
    po_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(po_table)
    story.append(Spacer(1, 8))

    # 4. Locked Machine Specifications
    story.append(Paragraph("<b>LOCKED TECHNICAL SPECIFICATIONS (FOR PRODUCTION SHOP FLOOR):</b>", body_bold))
    specs_data = [
        [Paragraph("Specification Parameter", th_style), Paragraph("Approved Technical Rating & Configuration", th_style)],
        [Paragraph("Equipment Model Code (PRKEY)", td_bold), Paragraph(f"<b>{model.prkey}</b>", td_style)],
        [Paragraph("Equipment Nomenclature", td_bold), Paragraph(model.idesc, td_style)],
        [Paragraph("Equipment Category & Brand", td_bold), Paragraph(f"{model.type} | OEM: {model.brand}", td_style)],
        [Paragraph("Quantity to Manufacture", td_bold), Paragraph(f"<b>{quote.quantity} Unit(s)</b>", td_bold)],
        [Paragraph("Motor Rating", td_bold), Paragraph(model.motor, td_style)],
        [Paragraph("Drive Transmission Type", td_bold), Paragraph(f"<b>{model.vsd_fs}</b> (Inverter Variable Speed / Fixed Speed)", td_style)],
        [Paragraph("Operating Working Pressure", td_bold), Paragraph(model.maximum_pressure, td_style)],
        [Paragraph("Free Air Delivery Flow", td_bold), Paragraph(model.fad_cfm, td_style)],
        [Paragraph("Dimensional Footprint", td_bold), Paragraph(model.dimension, td_style)],
        [Paragraph("Approved GA Blueprint Layout", td_bold), Paragraph(f"Certified Blueprint: <b>{quote.ga_drawing_id}</b>", td_style)],
    ]
    specs_table = Table(specs_data, colWidths=[185, 340])
    specs_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2986cc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(specs_table)
    story.append(Spacer(1, 8))

    # 5. Production Customizations & Committed Schedule
    story.append(Paragraph("<b>FACTORY ASSEMBLY & DISPATCH SCHEDULE:</b>", body_bold))
    sched_data = [
        [
            Paragraph("<b>Target Dispatch Date:</b>", td_bold),
            Paragraph(f"<font color='#2986cc' size='9'><b>{ofm.committed_dispatch_date or 'To be scheduled'}</b></font>", td_style),
            Paragraph("<b>Paint Shade:</b>", td_bold),
            Paragraph(ofm.paint_shade, td_style)
        ],
        [
            Paragraph("<b>Electrical Supply:</b>", td_bold),
            Paragraph(ofm.electrical_supply, td_style),
            Paragraph("<b>Air Outlet Nozzle:</b>", td_bold),
            Paragraph(ofm.air_discharge_nozzle, td_style)
        ],
        [
            Paragraph("<b>Special Instructions:</b>", td_bold),
            Paragraph(ofm.special_factory_instructions or "Standard ATCORP Factory Test Certificate & Warranty Card to be packed with machine.", td_style),
            "", ""
        ]
    ]
    sched_table = Table(sched_data, colWidths=[120, 142, 110, 153])
    sched_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('SPAN', (1,2), (3,2)),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(sched_table)
    story.append(Spacer(1, 10))

    # 6. Signatures block
    sig_data = [
        [
            Paragraph("<b>PREPARED BY (SALES ENGG)</b><br/><br/>Rajesh Sharma<br/>Sales & CPQ Execution", small_text),
            Paragraph("<b>PO SCRUTINY CLEARED BY</b><br/><br/>Virendra Singh<br/>Commercial Head", small_text),
            Paragraph("<b>ACCEPTED BY FACTORY PPC</b><br/><br/>R. K. Verma<br/>Production Planning & Control", small_text),
            Paragraph("<b>QUALITY ASSURANCE (QA)</b><br/><br/>Shop Floor Inspector<br/>Testing & Dispatch Bay", small_text)
        ]
    ]
    sig_table = Table(sig_data, colWidths=[131, 131, 131, 132])
    sig_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(sig_table)

    doc.build(story)
    buffer.seek(0)
    return buffer

