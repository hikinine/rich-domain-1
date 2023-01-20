import Utils from '../../lib/utils/util';

describe('utils', () => {

    describe('string', () => {
        it('should remove space with success', () => {
            const text = " Some Text With Space ";
            const result = Utils.string(text).removeSpaces();
            expect(result).toBe("SomeTextWithSpace");
        });
    
        it('should do not remove numbers', () => {
            const text = "S0meT3xtW1thSp4ce";
            const result = Utils.string(text).removeSpaces();
            expect(result).toBe("S0meT3xtW1thSp4ce");
        });
    
        it('should return same value if is not string', () => {
            const invalid = 100 as any;
            const result = Utils.string(invalid).removeSpaces();
            expect(result).toBe(100);
        });

        it('should remove special char with success', () => {
            const text = "Some #Text @With Special&* Chars";
           const result = Utils.string(text).removeSpecialChars();
            expect(result).toBe("Some Text With Special Chars");
        });
    
        it('should do not remove numbers', () => {
            const text = "S0meT3xtW1thSp4ce";
           const result = Utils.string(text).removeSpecialChars();
            expect(result).toBe("S0meT3xtW1thSp4ce");
        });

        it('should do not remove specific char', () => {
            const text = "4gileCouch4Devs";
           const result = Utils.string(text).removeChar('4');
            expect(result).toBe("gileCouchDevs");
        });
    
        it('should return same value if is not string', () => {
            const invalid = 100 as any;
            const result = Utils.string(invalid).removeSpecialChars();
            expect(result).toBe(100);
        });

        it('should replace value "a" to 4', () => {  
            const target = "Hi, My Name Is Jane Doe, I am 18 years old";
            const char = 'a';
            const value = '4';
            const result = Utils.string(target).replace(char).to(value);
            expect(result).toBe("Hi, My N4me Is J4ne Doe, I 4m 18 ye4rs old");
        });

        it('should remove numbers with success', () => {  
            const target = "I have 7 cars, I am 31 years old, the status is 200";
            const result = Utils.string(target).removeNumbers();
            expect(result).toBe("I have  cars, I am  years old, the status is ");
        });

        it('should remove numbers with success', () => {  
            const target = "404";
            const result = Utils.string(target).removeNumbers();
            expect(result).toBe("");
        });
    });

    describe('numbers', () => {
        it('should multiply 70 x 7 = 490 as number', () => {  
            const result = Utils.number(70).multiplyBy(7);
            expect(result).toBe(490);
        });

        it('should multiply 70 x 7 = 490 as string', () => {  
            const result = Utils.number('70' as any).multiplyBy('7' as any);
            expect(result).toBe(490);
        });

        it('should divide 70 / 7 = 10 as number', () => {  
            const result = Utils.number(70).divideBy(7);
            expect(result).toBe(10);
        });

        it('should divide 70 / 7 = 10 as string', () => {  
            const result = Utils.number('70' as any).divideBy('7' as any);
            expect(result).toBe(10);
        });

        it('should subtract 70 - 7 = 63 as number', () => {  
            const result = Utils.number(70).subtract(7);
            expect(result).toBe(63);
        });

        it('should divide 70 - 7 = 63 as string', () => {  
            const result = Utils.number('70' as any).subtract('7' as any);
            expect(result).toBe(63);
        });

        it('should sum 70 + 7 = 77 as number', () => {  
            const result = Utils.number(70).sum(7);
            expect(result).toBe(77);
        });

        it('should sum 70 + 7 = 77 as string', () => {  
            const result = Utils.number('70' as any).sum('7' as any);
            expect(result).toBe(77);
        });
    });
});
