import json,re,math,difflib
from faster_whisper import WhisperModel
A='/workspace/engine-real/audio/'
spoken=open('/workspace/engine-real/script/spoken.txt').read().strip().split('\n')
m=WhisperModel('small.en',compute_type='int8')
segs,_=m.transcribe(__import__('numpy').frombuffer(__import__('subprocess').check_output(['ffmpeg','-v','error','-i',A+'vo.mp3','-ar','16000','-ac','1','-f','s16le','-']),dtype='int16').astype('float32')/32768,word_timestamps=True,language='en')
H=[(w.word.strip(),w.start,w.end) for s in segs for w in s.words]
open(A+'vo-transcript.txt','w').write(' '.join(h[0] for h in H)+'\n')
norm=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
S=[];
for i,l in enumerate(spoken,1):
    for w in l.split(): S.append((w,i))
hn=[norm(h[0]) for h in H]; sn=[norm(w[0]) for w in S]
# tokens may differ (numbers, $); align via sequence matcher
sm=difflib.SequenceMatcher(None,sn,hn,autojunk=False)
tm=[None]*len(S)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag=='equal':
        for k in range(i2-i1): tm[i1+k]=(H[j1+k][1],H[j1+k][2])
    elif tag=='replace' and j2>j1:
        a,b=H[j1][1],H[j2-1][2];n=i2-i1
        for k in range(n): tm[i1+k]=(a+(b-a)*k/n,a+(b-a)*(k+1)/n)
unal=[S[i][0] for i,t in enumerate(tm) if t is None]
# fill missing by interpolation
for i,t in enumerate(tm):
    if t is None:
        p=next((tm[j][1] for j in range(i-1,-1,-1) if tm[j]),0.0)
        n=next((tm[j][0] for j in range(i+1,len(tm)) if tm[j]),p)
        tm[i]=(p,max(p,n))
import subprocess
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',A+'vo.mp3']))
dur=round(dur,6);fps=24
fr=lambda t:round(t*fps)+1
words=[dict(w=S[i][0],start=round(t[0],3),end=round(t[1],3),line=S[i][1],f_start=fr(t[0]),f_end=fr(t[1])) for i,t in enumerate(tm)]
json.dump(dict(file='vo.mp3',fps=fps,duration=dur,model='faster-whisper-small.en',note='aligned to script/spoken.txt (frames f=round(t*fps)+1)',unaligned=unal,heard_differently=[],words=words),open(A+'vo-words.json','w'),indent=1,ensure_ascii=False)
ve=math.ceil(dur*fps-0.05)
lines=[]
for i,l in enumerate(spoken,1):
    ws=[w for w in words if w['line']==i]
    lines.append(dict(line=i,start=ws[0]['start'],end=ws[-1]['end'],f_start=ws[0]['f_start'],f_end=ws[-1]['f_end'],text=l))
json.dump(dict(file='vo.mp3',duration=dur,fps=fps,video_end=ve,method='faster-whisper small.en words aligned to spoken.txt; frames f=round(t*fps)+1; video_end=ceil(duration*fps-0.05)',lines=lines),open(A+'vo-timing.json','w'),indent=1,ensure_ascii=False)
# captions: chunks of <=5 words, break at line ends
def ts(t):
    h=int(t//3600);mi=int(t%3600//60);s=t%60
    return f'{h:02}:{mi:02}:{int(s):02},{int(round((s-int(s))*1000)):03}'
out=[];n=1
for i in range(1,len(spoken)+1):
    ws=[w for w in words if w['line']==i]
    for k in range(0,len(ws),5):
        c=ws[k:k+5]
        out.append(f"{n}\n{ts(c[0]['start'])} --> {ts(c[-1]['end'])}\n{re.sub(r'[,.?]+$','',' '.join(x['w'] for x in c))}\n");n+=1
open(A+'captions-draft.srt','w').write('\n'.join(out))
print(dur,ve,len(unal),unal,len(S),len(H))
for l in lines:print(l['line'],l['start'],l['end'],l['f_start'],l['f_end'])
