
    file.save(filepath)

    text = extract_text_from_pdf(filepath)
    summary = summarize_case(text) if text else "No text found."