"""Independent execution of trusted, generated exercise fixtures only."""
import builtins
import heapq
import io
import json
import sqlite3
import sys

records=json.load(sys.stdin)
counts={"python":0,"sql":0,"graph":0}
for item in records:
    kind=item["kind"]
    if kind=="python":
        output=io.StringIO()
        def capture(*args,**kwargs):
            builtins.print(*args,file=output,**kwargs)
        def read_virtual(name,mode="r",encoding=None):
            assert mode=="r" and name in item.get("files",{}),(name,mode)
            return io.StringIO(item["files"][name])
        namespace={"__builtins__":{"print":capture,"range":range,"len":len,"int":int,"open":read_virtual}}
        exec(compile(item["code"],"<generated-exercise>","exec"),namespace)
        actual=float(output.getvalue().strip())
    elif kind=="sql":
        with sqlite3.connect(":memory:") as db:
            db.execute("CREATE TABLE Results (score INTEGER NOT NULL)")
            db.executemany("INSERT INTO Results VALUES (?)",[(x,) for x in item["scores"]])
            actual=db.execute(item["query"]).fetchone()[0]
    elif kind=="graph":
        adjacency={}
        for a,b,weight in item["edges"]:
            assert weight>0
            adjacency.setdefault(a,[]).append((b,weight))
            adjacency.setdefault(b,[]).append((a,weight))
        distances={"A":0}
        queue=[(0,"A")]
        while queue:
            distance,node=heapq.heappop(queue)
            if distance!=distances[node]:
                continue
            for other,weight in adjacency[node]:
                candidate=distance+weight
                if candidate<distances.get(other,float("inf")):
                    distances[other]=candidate
                    heapq.heappush(queue,(candidate,other))
        actual=distances["D"]
    else:
        raise AssertionError(kind)
    assert actual==item["expected"],(item,actual)
    counts[kind]+=1
print(json.dumps(counts))
