"""Read original settlement symbols into vector anchors; never modify the image."""
import cv2, numpy as np, json, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
src=root/'assets/images/maps/faerun-user-original.jpg'
im=cv2.imread(str(src),0)
template=im[1150:1164,1030:1043]
score=cv2.matchTemplate(im,template,cv2.TM_CCOEFF_NORMED)
peaks=(score==cv2.dilate(score,np.ones((15,15),np.uint8))) & (score>=.78)
yy,xx=np.where(peaks)
markers=[]
for x,y in zip(xx,yy):
    x,y=int(x)+6,int(y)+7
    if (x>4260 and y>2420) or (x<420 and y>2830): continue
    markers.append(dict(x=x,y=y,confidence=round(float(score[y-7,x-6]),4),kind='source-settlement',verified=False))
out=dict(sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest(),method='Original double-circle settlement symbol template; candidate anchors, not a complete or manually verified gazetteer.',markers=markers)
(root/'data/map-source-markers.json').write_text(json.dumps(out,separators=(',',':')),encoding='utf-8')
print(len(markers),'source settlement anchors')
