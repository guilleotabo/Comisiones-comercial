// Carga de configuracion desde Google Sheets con cache local
(function(window){
    const CONFIG_KEY = 'commissionConfig';
    const BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vScu3Ajex4xDRxnXzml6ef1lKaDtsnEivVYv4nFTiNQa9PoO5LUh9PNg7H51Mq6EvxOy0UBhxJgaAdW/pub?output=csv';
    const SHEETS = ['Config','Niveles','Metas','Pagos','Multi_Conversion','Multi_Empatia','Multi_Proceso','Multi_Mora'];

    const DEFAULT_CONFIG = {
        config: { base_fija: 3000000, maximo_subtotal: 14000000 },
        niveles: ['Capilla','Junior','Senior A','Senior B','Máster','Genio'],
        iconos: ['🏠','👤','⭐','💎','👑','🏆'],
        metas: {
            montoInterno: [600000000,800000000,900000000,1000000000,1100000000,1200000000],
            montoExterno: [50000000,100000000,150000000,200000000,300000000,400000000],
            montoRecuperado: [40000000,60000000,80000000,100000000,120000000,150000000],
            cantidad: [6,8,9,10,12,13]
        },
        pagos: {
            base: 3000000,
            carrera: [0,0,500000,1000000,1500000,2000000],
            montoInterno: [500000,600000,1000000,1400000,2000000,2500000],
            montoExterno: [800000,1000000,1500000,2000000,2500000,3300000],
            montoRecuperado: [300000,400000,500000,600000,800000,1000000],
            cantidad: [0,400000,600000,700000,1000000,1200000],
            equipo: [0,0,0,500000,800000,1000000]
        },
        multiplicadores: {
            conversion: [
                {min:10,mult:1.1,text:'10%+'},
                {min:8,mult:1.0,text:'8%'},
                {min:7,mult:0.8,text:'7%'},
                {min:6,mult:0.7,text:'6%'},
                {min:5,mult:0.6,text:'5%'},
                {min:4,mult:0.5,text:'4%'},
                {min:0,mult:0.3,text:'<4%'}
            ],
            empatia: [
                {min:96,mult:1.0,text:'96%+'},
                {min:90,mult:0.9,text:'90%'},
                {min:80,mult:0.5,text:'80%'},
                {min:70,mult:0.3,text:'70%'},
                {min:0,mult:0,text:'<70%'}
            ],
            proceso: [
                {min:95,mult:1.0,text:'95%+'},
                {min:90,mult:0.95,text:'90%'},
                {min:85,mult:0.8,text:'85%'},
                {min:70,mult:0.3,text:'70%'},
                {min:0,mult:0,text:'<70%'}
            ],
            mora: [
                {min:0,mult:1.05,text:'0-2%'},
                {min:3,mult:0.95,text:'3-7%'},
                {min:8,mult:0.9,text:'8-9%'},
                {min:10,mult:0.85,text:'10-14%'},
                {min:15,mult:0.7,text:'15%+'}
            ]
        }
    };

    function setStatus(msg){
        const el = document.getElementById('configStatus');
        if(el) el.textContent = msg;
    }

    function parseNumber(v){
        if(v === undefined) return '';
        const n = parseFloat(v.toString().replace(/[^0-9.-]/g,''));
        return isNaN(n) ? v : n;
    }

    function parseCSV(text){
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(h=>h.trim());
        return lines.slice(1).map(line => {
            const cols = line.split(',');
            const obj = {};
            headers.forEach((h,i)=>{ obj[h] = parseNumber((cols[i]||'').trim()); });
            return obj;
        });
    }

    async function fetchSheet(name){
        const res = await fetch(BASE_URL + '&sheet=' + encodeURIComponent(name));
        if(!res.ok) throw new Error(name+': '+res.status);
        return parseCSV(await res.text());
    }

    async function fetchAll(){
        const data = {};
        for(const s of SHEETS){
            data[s] = await fetchSheet(s);
        }
        return data;
    }

    function buildConfig(raw){
        const cfg = {};
        cfg.config = raw.Config && raw.Config[0] ? raw.Config[0] : {};

        if(raw.Niveles){
            raw.Niveles.sort((a,b)=>a.nivel-b.nivel);
            cfg.niveles = raw.Niveles.map(r=>r.nombre);
            cfg.iconos = raw.Niveles.map(r=>r.icono);
        }

        cfg.metas = {montoInterno:[],montoExterno:[],montoRecuperado:[],cantidad:[]};
        if(raw.Metas){
            raw.Metas.sort((a,b)=>a.nivel-b.nivel);
            raw.Metas.forEach(r=>{
                cfg.metas.montoInterno.push(Number(r.monto_interno)||0);
                cfg.metas.montoExterno.push(Number(r.monto_externo)||0);
                cfg.metas.montoRecuperado.push(Number(r.monto_recuperado)||0);
                cfg.metas.cantidad.push(Number(r.cantidad)||0);
            });
        }

        cfg.pagos = {base: Number(cfg.config.base_fija)||DEFAULT_CONFIG.pagos.base,
                     carrera:[],montoInterno:[],montoExterno:[],montoRecuperado:[],cantidad:[],equipo:[]};
        if(raw.Pagos){
            raw.Pagos.sort((a,b)=>a.nivel-b.nivel);
            raw.Pagos.forEach(r=>{
                cfg.pagos.carrera.push(Number(r.carrera)||0);
                cfg.pagos.montoInterno.push(Number(r.monto_interno)||0);
                cfg.pagos.montoExterno.push(Number(r.monto_externo)||0);
                cfg.pagos.montoRecuperado.push(Number(r.monto_recuperado)||0);
                cfg.pagos.cantidad.push(Number(r.cantidad)||0);
                cfg.pagos.equipo.push(Number(r.equipo)||0);
            });
        }

        cfg.multiplicadores = {
            conversion: raw.Multi_Conversion ? raw.Multi_Conversion.map(r=>({min:Number(r.minimo)||0,mult:Number(r.multiplicador)||0,text:r.texto||''})) : [],
            empatia: raw.Multi_Empatia ? raw.Multi_Empatia.map(r=>({min:Number(r.minimo)||0,mult:Number(r.multiplicador)||0,text:r.texto||''})) : [],
            proceso: raw.Multi_Proceso ? raw.Multi_Proceso.map(r=>({min:Number(r.minimo)||0,mult:Number(r.multiplicador)||0,text:r.texto||''})) : [],
            mora: raw.Multi_Mora ? raw.Multi_Mora.map(r=>({min:Number(r.minimo)||0,mult:Number(r.multiplicador)||0,text:r.texto||''})) : []
        };

        return cfg;
    }

    async function loadConfiguration(force){
        const cached = JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}');
        if(!force && cached.timestamp && cached.data){
            setStatus('Actualizado: '+new Date(cached.timestamp).toLocaleString());
            return cached.data;
        }
        setStatus('Cargando configuración...');
        try{
            const raw = await fetchAll();
            const cfg = buildConfig(raw);
            const payload = {timestamp: Date.now(), data: cfg};
            localStorage.setItem(CONFIG_KEY, JSON.stringify(payload));
            setStatus('Actualizado: '+new Date(payload.timestamp).toLocaleString());
            return cfg;
        }catch(e){
            console.error('Config load failed', e);
            if(cached.data){
                setStatus('Offline - datos del '+new Date(cached.timestamp).toLocaleString());
                return cached.data;
            }
            setStatus('Error - usando valores por defecto');
            return DEFAULT_CONFIG;
        }
    }

    window.loadConfiguration = loadConfiguration;
    window.defaultConfig = DEFAULT_CONFIG;
})(window);
