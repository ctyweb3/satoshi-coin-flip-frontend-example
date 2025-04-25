import { useEffect, useRef, useState } from 'react';
import './CoinAnimation.css';

interface CoinAnimationProps {
    guess: string;
    isFlipping: boolean;
    onFlipEnd?: (result: string) => void;
}

export function CoinAnimation({ guess, isFlipping, onFlipEnd }: CoinAnimationProps) {
    const coinRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);
    const [result, setResult] = useState<string>('');

    // 处理硬币翻转动画
    useEffect(() => {
        if (!isFlipping || !coinRef.current || !shadowRef.current) return;

        // 随机结果
        const flipResult = Math.random() < 0.5 ? 'H' : 'T';
        setResult(flipResult);

        // 重置动画
        coinRef.current.classList.remove('flipping');
        shadowRef.current.classList.remove('flipping');

        // 触发重排
        void coinRef.current.offsetWidth;
        void shadowRef.current.offsetWidth;

        // 添加动画类
        coinRef.current.classList.add('flipping');
        shadowRef.current.classList.add('flipping');

        // 动画结束后调用回调
        const timer = setTimeout(() => {
            if (onFlipEnd) {
                onFlipEnd(flipResult);
            }
        }, 2000); // 动画持续时间

        return () => clearTimeout(timer);
    }, [isFlipping, onFlipEnd]);

    // 计算用户猜测是否正确
    const isCorrectGuess = result && guess && result === guess;

    return (
        <div className="coin-animation-container">
            <div className="coin" ref={coinRef}>
                <div className="coin-side coin-front"></div>
                <div className="coin-side coin-back"></div>
            </div>
            <div className="coin-shadow" ref={shadowRef}></div>

            {result && !isFlipping && (
                <div
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: '0',
                        right: '0',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: isCorrectGuess ? '#4CAF50' : '#F44336'
                    }}
                >
                    {result === 'H' ? '正面!' : '反面!'}
                </div>
            )}
        </div>
    );
} 