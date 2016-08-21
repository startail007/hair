var MathEx = {
    get DEG180() {
        return Math.PI / 180;
    },
    get DEG90() {
        return Math.PI / 90;
    },
    VectorAngle: function(pVector0, pVector1) {
        var temp0 = (pVector0.x * pVector1.x + pVector0.y * pVector1.y) / pVector0.len() / pVector1.len();
        var temp = Math.acos(temp0 <= 1 ? temp0 : 1) * 180 / Math.PI;
        return (pVector0.x * pVector1.y - pVector0.y * pVector1.x) < 0 ? temp : -temp;
    },
    Turn: function(pPoint, pValue, pCPoint) {
        if (pCPoint == undefined) {
            pCPoint = new Point();
        }
        var WH01 = pPoint.sub(pCPoint);
        var temp = new Point();
        var COS = Math.cos(-pValue * MathEx.DEG180);
        var SIN = Math.sin(-pValue * MathEx.DEG180);
        temp.x = WH01.x * COS + WH01.y * SIN + pCPoint.x;
        temp.y = -WH01.x * SIN + WH01.y * COS + pCPoint.y;
        return temp;
    }
};
var NumberEx = {
    BasicCrop: function(pNum) {
        if (pNum < 0) {
            return 0;
        } else if (pNum > 1) {
            return 1;
        } else {
            return pNum;
        }
    }
};

function ABC(pA, pB, pC) {
    var temp = pB * pB - 4 * pA * pC;
    if (temp < 0) {
        return null;
    }
    temp = Math.sqrt(temp);
    var temp0 = -pB + temp;
    var temp1 = -pB - temp;
    if (pA != 0) {
        return [temp0 / (2 * pA), temp1 / (2 * pA)];
    } else {
        if (temp0 != 0 && temp1 != 0) {
            return [(2 * pC) / temp0, (2 * pC) / temp1];
        } else if (temp0 != 0) {
            return [(2 * pC) / temp0];
        } else {
            return [(2 * pC) / temp1];
        }
    }
}

function ChangeValue(pT, pWeights) {
    if (pWeights == undefined) {
        pWeights = 0.5
    }
    var temp = ABC(1 - 2 * pWeights, 2 * pWeights, -pT);
    var temp0 = 0;
    if (temp) {
        if (temp.length > 1) {
            if (temp[0] > 0) {
                temp0 = temp[0];
            } else if (temp[0] > 0) {
                temp0 = temp[1];
            }
        } else {
            if (temp[0] > 0) {
                temp0 = temp[0];
            }
        }
    }
    return temp0;
}

function Bezier(pT, pA, pB, pC) {
    return (1 - pT) * (1 - pT) * pA + 2 * pT * (1 - pT) * pB + pT * pT * pC
}

document.addEventListener("DOMContentLoaded", function(event) {
    var GraffitiCanvas01 = document.getElementById('Canvas01');
    var ctx = GraffitiCanvas01.getContext("2d");
    var n = 20;
    var p = new Array(n);
    var len = new Array(n);
    var v = new Array(n);
    var Weights = new Array(n);

    for (var i = 0; i < p.length; i++) {
        p[i] = new Point(400, 600 - i * 20);
        v[i] = new Point(0, 0);
        Weights[i] = 0.5 * (0.2 + 0.8 * (1 - i / p.length));
        len[i] = 30 * (0.5 + 0.5 * (1 - i / p.length));
    }
    var mp = new Point(400, 600);
    EventUtil.addHandler(GraffitiCanvas01, 'mousemove', mm);

    function mm(e) {
        mp.set(e.offsetX, e.offsetY);
    }
    var ID = setInterval(ef, 1000 / 60);

    function ef() {
        ctx.clearRect(0, 0, GraffitiCanvas01.width, GraffitiCanvas01.height);
        var move;
        var ax;
        var ay;
        var rate = 1;
        var i;
        var ssXY = new Point();
        var angle
        var vector01
        var vector02
        p[0] = mp.sub(p[0]).mul(0.6).add(p[0]);
        v[0] = v[0].mul((1 - rate) * 0.90 + 0.10);
        for (i = 1; i < p.length; i++) {
            vector02 = ((i - 2) >= 0) ? p[i - 1].sub(p[i - 2]) : (new Point(0, -1));
            vector01 = p[i].sub(p[i - 1]);
            angle = MathEx.VectorAngle(vector01, vector02);
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((Math.abs(angle) - 0) / (30 - 0)), 0.3), 1, 0, 1);
            ssXY = ssXY.mul(0.7).add(new Point(vector01.y, -vector01.x).div(vector01.len()).mul(rate * angle * Weights[i]));
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((vector01.len() - 5) / (40 - 5)), 0.3), 1, 0, 1);
            move = vector01.mul(((len[i] / vector01.len()) - 1) * rate * Weights[i]);
            ssXY = ssXY.add(move);
            v[i] = v[i].add(ssXY);
        }

        for (i = 1; i < p.length; i++) {
            p[i] = p[i].add(v[i]);
        }

        for (i = 1; i < p.length; i++) {
            vector01 = p[i].sub(p[i - 1]);
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((vector01.len() - 5) / (40 - 5)), 0.3), 1, 0.5, 1);
            move = vector01.mul(((len[i] / vector01.len()) - 1) * rate);
            p[i] = p[i].add(move);
            v[i] = v[i].mul((1 - rate) * 0.90 + 0.10);
        }
        ctx.lineCap = "round";
        ctx.lineWidth = 1;
        ctx.strokeStyle = Change16(0x0000ff);
        for (i = 0; i < p.length; i++) {
            ctx.beginPath();            
            ctx.arc(p[i].x, p[i].y, len[i] / 2, 0, Math.PI * 2, true);
            ctx.stroke();
        }
        
        ctx.lineCap = "round";        
        ctx.strokeStyle = Change16(0xff0000);
        for (i = 1; i < p.length; i++) {
            ctx.beginPath();
            ctx.lineWidth = 5 * (1 - i / p.length);
            ctx.moveTo(p[i].x, p[i].y);
            ctx.lineTo(p[i - 1].x, p[i - 1].y);
            ctx.stroke();
        }
    }
});