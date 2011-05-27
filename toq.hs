q a b c = putStrLn $ b 
          ++ [toEnum 10,'q','(']
          ++ show b 
          ++ [',']
          ++ show c 
          ++ [',']
          ++ show a 
          ++ [')']

main = q 
       "q a b c=putStrLn $ b ++ [toEnum 10,'q','('] ++ show b ++ [','] ++ show c ++ [','] ++ show a ++ [')']" 
       "def q(a,b,c):print b+chr(10)+'q('+repr(b)+','+repr(c)+','+repr(a)+')'" 
       "def e(x) return 34.chr+x+34.chr end;def q(a,b,c) print b+10.chr+'main=q '+e(b)+' '+e(c)+' '+e(a)+' '+10.chr end"
