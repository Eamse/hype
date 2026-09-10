'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const SWIPE_THRESHOLD = 50;
export default function HeroCarousel({ images, children, }: {
    images: string[];
    children?: React.ReactNode;
}) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const dragStartX = useRef<number | null>(null);
    const dragDeltaX = useRef(0);
    const isDragging = useRef(false);
    const hintRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const next = useCallback(() => {
        setCurrent((p) => (p + 1) % images.length);
    }, [images.length]);
    const prev = useCallback(() => {
        setCurrent((p) => (p - 1 + images.length) % images.length);
    }, [images.length]);
    useEffect(() => {
        if (images.length <= 1 || paused)
            return;
        const id = setInterval(next, 4000);
        return () => clearInterval(id);
    }, [images.length, paused, next]);
    if (images.length === 0)
        return null;
    const moveHintTo = (e: React.PointerEvent | React.MouseEvent) => {
        const section = sectionRef.current;
        const hint = hintRef.current;
        if (!section || !hint)
            return;
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hint.style.transform = `translate(${x + -33}px, ${y + -35}px)`;
    };
    const handlePointerDown = (e: React.PointerEvent) => {
        if (images.length <= 1)
            return;
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragDeltaX.current = 0;
        setPaused(true);
    };
    const handlePointerMove = (e: React.PointerEvent) => {
        moveHintTo(e);
        if (!isDragging.current || dragStartX.current === null)
            return;
        dragDeltaX.current = e.clientX - dragStartX.current;
    };
    const endDrag = () => {
        if (!isDragging.current)
            return;
        isDragging.current = false;
        dragStartX.current = null;
        if (dragDeltaX.current > SWIPE_THRESHOLD) {
            prev();
        }
        else if (dragDeltaX.current < -SWIPE_THRESHOLD) {
            next();
        }
        dragDeltaX.current = 0;
        setPaused(false);
    };
    return (<section ref={sectionRef} className="hero-carousel" style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: '#000',
            touchAction: 'pan-y',
            cursor: images.length > 1 ? 'grab' : undefined,
            userSelect: 'none',
        }} onMouseEnter={(e) => {
            moveHintTo(e);
            if (hintRef.current)
                hintRef.current.style.opacity = '1';
        }} onMouseLeave={() => {
            endDrag();
            if (hintRef.current)
                hintRef.current.style.opacity = '0';
        }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
      {images.map((url, idx) => (<div key={url} style={{
                position: 'absolute',
                inset: 0,
                opacity: idx === current ? 1 : 0,
                transition: 'opacity 0.8s ease',
            }}>
          <Image src={url} alt={`hero-${idx}`} fill priority={idx === 0} fetchPriority={idx === 0 ? 'high' : undefined} loading={idx === 0 ? 'eager' : undefined} sizes="100vw" draggable={false} style={{ objectFit: 'cover', pointerEvents: 'none' }}/>
        </div>))}
      
      {images.length > 1 && (<div ref={hintRef} className="hero-carousel-swipe-hint" aria-hidden="true">
          <ChevronLeft size={14} strokeWidth={2.5}/>
          <ChevronRight size={14} strokeWidth={2.5}/>
        </div>)}

      
      {images.length > 1 && (<div style={{
                position: 'absolute',
                left: '50%',
                bottom: 20,
                transform: 'translateX(-50%)',
                zIndex: 3,
                display: 'flex',
                gap: 6,
                width: '60%',
                maxWidth: 300,
            }}>
          {images.map((_, idx) => (<button key={idx} onClick={() => setCurrent(idx)} aria-label={`Go to slide ${idx + 1}`} style={{
                    flex: 1,
                    height: 2,
                    background: idx === current
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    padding: 0,
                }}/>))}
        </div>)}

      
      {children && (<div style={{
                position: 'absolute',
                left: '50%',
                bottom: 60,
                transform: 'translateX(-50%)',
                zIndex: 3,
                maxWidth: 'calc(100% - 48px)',
                display: 'flex',
                gap: 24,
            }}>
          {children}
        </div>)}
    </section>);
}
