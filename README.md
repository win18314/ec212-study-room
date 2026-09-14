# EC212 Study Room

เว็บไซต์สื่อการสอนและแผนทบทวนสอบกลางภาค EC212 อยู่ในโฟลเดอร์ `Summarize/` พร้อมเอกสารอ้างอิงใน `Source/`, `Lecture_Notes/` และ `TextBook/`.

## เปิดเว็บในเครื่อง

เปิด `Summarize/index.html` ในเบราว์เซอร์ หรือใช้เซิร์ฟเวอร์ไฟล์แบบง่ายจากโฟลเดอร์นี้ แล้วเข้า `http://localhost:8000/Summarize/`.

## เตรียมอัปโหลด GitHub

ไฟล์ `TextBook/Principles of Economics.pdf` มีขนาดเกิน 100 MB จึงต้องใช้ Git LFS หากต้องการเก็บไฟล์นี้ไว้ใน repository:

```bash
git lfs install
git lfs track "TextBook/Principles of Economics.pdf"
git add .gitattributes "TextBook/Principles of Economics.pdf"
```

ถ้าไม่ต้องการใช้ Git LFS ให้ลบไฟล์ดังกล่าวออกจากชุดที่จะอัปโหลด และนำลิงก์ตำรานี้ออกจาก `Summarize/content.js` ก่อนเผยแพร่เว็บ

## GitHub Pages

เว็บเป็น static site และมี workflow ใน `.github/workflows/pages.yml` สำหรับ deploy จากโฟลเดอร์ `Summarize/` ตรวจสอบสิทธิ์การเผยแพร่ PDF ก่อนตั้ง repository เป็น Public; แนะนำให้เริ่มจาก Private repository.
