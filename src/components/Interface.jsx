import { Button, IconButton, Typography, Snackbar, Alert, CircularProgress, Fade, Tooltip, Drawer, MenuItem, Select, InputLabel, FormControl, Menu, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import { PlayArrow, Settings, Pause, Replay, CompareArrows, Close, Stop, ExpandMore, ExpandLess } from "@mui/icons-material";
import Slider from "./Slider";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { INITIAL_COLORS, LOCATIONS } from "../config";
import { arrayToRgb, rgbToArray } from "../helpers";

const Interface = forwardRef(({ canStart, started, animationEnded, playbackOn, time, maxTime, settings, colors, loading, timeChanged, cinematic, changeRadius, changeAlgorithm, setCinematic, setSettings, setColors, startPathfinding, toggleAnimation, clearPath, changeLocation, mostrarRadio, setMostrarRadio, modoComparacion, entrarModoComparacion, salirModoComparacion, iniciarComparacion, detenerComparacion, resultadosComparacion, ejecutandoComparacion }, ref) => {
    const [sidebar, setSidebar] = useState(false);
    const [snack, setSnack] = useState({
        open: false,
        message: "",
        type: "error",
    });
    const [helper, setHelper] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [tablaVisible, setTablaVisible] = useState(true);
    const menuOpen = Boolean(menuAnchor);
    const helperTime = useRef(4800);
    const rightDown = useRef(false);
    const leftDown = useRef(false);

    const nombresAlgoritmos = {
        astar: "A*",
        bfs: "BFS",
        dfs: "DFS"
    };

    // Expose showSnack to parent from ref
    useImperativeHandle(ref, () => ({
        showSnack(message, type = "error") {
            setSnack({ open: true, message, type });
        },
    }));
      
    function closeSnack() {
        setSnack({...snack, open: false});
    }

    function closeHelper() {
        setHelper(false);
    }

    // Start pathfinding or toggle playback
    function handlePlay() {
        if(!canStart) return;
        if(!started && time === 0) {
            startPathfinding();
            return;
        }
        toggleAnimation();
    }
    
    function closeMenu() {
        setMenuAnchor(null);
    }

    window.onkeydown = e => {
        if(e.code === "ArrowRight" && !rightDown.current && !leftDown.current && (!started || animationEnded)) {
            rightDown.current = true;
            toggleAnimation(false, 1);
        }
        else if(e.code === "ArrowLeft" && !leftDown.current && !rightDown.current && animationEnded) {
            leftDown.current = true;
            toggleAnimation(false, -1);
        }
    };

    window.onkeyup = e => {
        if(e.code === "Escape") setCinematic(false);
        else if(e.code === "Space") {
            e.preventDefault();
            handlePlay();
        }
        else if(e.code === "ArrowRight" && rightDown.current) {
            rightDown.current = false;
            toggleAnimation(false, 1);
        }
        else if(e.code === "ArrowLeft" && animationEnded && leftDown.current) {
            leftDown.current = false;
            toggleAnimation(false, -1);
        }
        else if(e.code === "KeyR" && (animationEnded || !started)) clearPath();
    };

    // Show cinematic mode helper
    useEffect(() => {
        if(!cinematic) return;
        setHelper(true);
        setTimeout(() => {
            helperTime.current = 2500;
        }, 200);
    }, [cinematic]);

    // Resetear tabla cuando se sale del modo comparación
    useEffect(() => {
        if (!modoComparacion) {
            setTablaVisible(true);
        }
    }, [modoComparacion]);

    return (
        <>
            <div className={`fixed left-0 top-6 right-0 flex justify-center items-center gap-6 pointer-events-none transition-all duration-500 ease-out ${cinematic ? "-translate-y-[200%] opacity-0" : ""} max-[991px]:flex-wrap-reverse max-[991px]:top-[5px] max-[991px]:text-sm max-[991px]:gap-y-2.5 max-[991px]:gap-x-5`}>
                <div className="pointer-events-auto flex gap-2 bg-[#18181b]/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl border border-white/5">
                    {[0.5, 1, 2, 5, 10].map(speed => (
                        <Button
                            key={speed}
                            onClick={() => setSettings({...settings, velocidad: speed})}
                            variant="contained"
                            style={{
                                backgroundColor: settings.velocidad === speed ? "#10b981" : "#27272a",
                                color: "#e4e4e7",
                                minWidth: "50px",
                                paddingBlock: 8,
                                paddingInline: 12,
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: 500,
                                border: settings.velocidad === speed ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.08)",
                                boxShadow: settings.velocidad === speed ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "none"
                            }}
                            className="hover:bg-[#3f3f46] transition-all"
                        >
                            {speed}x
                        </Button>
                    ))}
                </div>
                <IconButton disabled={!canStart} onClick={handlePlay} style={{ backgroundColor: "#10b981", width: 60, height: 60, boxShadow: "0 8px 24px 0 rgba(16, 185, 129, 0.35)" }} size="large" className="pointer-events-auto hover:scale-105 transition-all">
                    {(!started || animationEnded && !playbackOn) 
                        ? <PlayArrow style={{ color: "#fff", width: 30, height: 30 }} fontSize="inherit" />
                        : <Pause style={{ color: "#fff", width: 30, height: 30 }} fontSize="inherit" />
                    }
                </IconButton>
                {!modoComparacion && (
                    <div className="w-auto max-[991px]:w-auto">
                        <Button disabled={!animationEnded && started} onClick={clearPath} style={{ color: "#e4e4e7", backgroundColor: "#27272a", paddingInline: 28, paddingBlock: 12, borderRadius: 14, fontSize: 15, fontWeight: 500, border: "1px solid rgba(255, 255, 255, 0.08)" }} variant="contained" className="pointer-events-auto shadow-lg hover:bg-[#3f3f46] transition-colors">Limpiar ruta</Button>
                    </div>
                )}
                {modoComparacion && (
                    <div className="w-auto max-[991px]:w-auto">
                        <Button onClick={salirModoComparacion} style={{ color: "#e4e4e7", backgroundColor: "#dc2626", paddingInline: 28, paddingBlock: 12, borderRadius: 14, fontSize: 15, fontWeight: 500, border: "1px solid rgba(255, 255, 255, 0.08)" }} variant="contained" className="pointer-events-auto shadow-lg hover:bg-[#b91c1c] transition-colors">Salir del Modo Comparación</Button>
                    </div>
                )}
            </div>

            <div className={`fixed left-6 top-6 flex gap-3 transition-all duration-500 ease-out ${cinematic ? "-translate-x-[250%] -translate-y-[250%] opacity-0 pointer-events-none" : ""} max-[991px]:flex-col max-[991px]:h-full max-[991px]:justify-end max-[991px]:top-auto max-[991px]:bottom-5`}>
                <Tooltip title="Configuración">
                    <IconButton onClick={() => {setSidebar(true);}} style={{ backgroundColor: "#18181b", width: 48, height: 48, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", border: "1px solid rgba(255, 255, 255, 0.08)" }} size="large" className="hover:bg-[#27272a] transition-colors">
                        <Settings style={{ color: "#e4e4e7", width: 22, height: 22 }} fontSize="inherit" />
                    </IconButton>
                </Tooltip>
                {!modoComparacion && (
                    <Tooltip title="Modo Comparación">
                        <IconButton onClick={entrarModoComparacion} style={{ backgroundColor: "#18181b", width: 48, height: 48, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", border: "1px solid rgba(255, 255, 255, 0.08)" }} size="large" className="hover:bg-[#27272a] transition-colors">
                            <CompareArrows style={{ color: "#e4e4e7", width: 22, height: 22 }} fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
            </div>

            <div className="absolute right-6 bottom-[10vh]">
                <Fade
                    in={loading}
                    style={{
                        transitionDelay: loading ? "50ms" : "0ms",
                    }}
                    unmountOnExit
                >
                    <CircularProgress color="inherit" />
                </Fade>
            </div>

            <Snackbar 
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }} 
                open={snack.open} 
                autoHideDuration={4000} 
                onClose={closeSnack}>
                <Alert 
                    onClose={closeSnack} 
                    severity={snack.type} 
                    style={{ width: "100%", color: "#fff" }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>

            <Snackbar 
                anchorOrigin={{ vertical: "top", horizontal: "center" }} 
                open={helper} 
                autoHideDuration={helperTime.current} 
                onClose={closeHelper}
            >
                <div className="text-center py-4 px-6 min-w-[420px] flex flex-col items-center justify-center gap-2.5 border border-white/10 bg-[#18181b]/95 backdrop-blur-xl rounded-2xl shadow-2xl text-[#e4e4e7]">
                    <Typography fontSize="18px" fontWeight="600" className="text-white">Modo cinemático</Typography>
                    <Typography fontSize="14px" className="text-zinc-300">Usa atajos de teclado para controlar la animación</Typography>
                    <Typography fontSize="14px" className="text-zinc-300">Presiona <span className="font-mono bg-[#27272a] px-2.5 py-1 rounded-lg text-white border border-white/10">ESC</span> para salir</Typography>
                </div>
            </Snackbar>

            <Drawer
                className={`transition-all duration-500 ease-out ${cinematic ? "-translate-x-[200%] opacity-0 pointer-events-none" : ""}`}
                anchor="left"
                open={sidebar}
                onClose={() => {setSidebar(false);}}
                PaperProps={{
                    sx: {
                        backgroundColor: "#09090b",
                        borderRight: "1px solid rgba(255, 255, 255, 0.08)"
                    }
                }}
            >
                <div className="flex flex-col min-w-[320px] p-6 gap-6 basis-full">

                    {modoComparacion && (
                        <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg p-3">
                            <Typography style={{ color: "#3b82f6", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
                                Modo Comparación Activo
                            </Typography>
                        </div>
                    )}

                    <FormControl variant="filled">
                        <InputLabel style={{ fontSize: 14, color: "#71717a" }} id="algo-select">Algoritmo</InputLabel>
                        <Select
                            labelId="algo-select"
                            value={settings.algoritmo}
                            onChange={e => {changeAlgorithm(e.target.value);}}
                            required
                            style={{ backgroundColor: "#18181b", color: "#e4e4e7", width: "100%", paddingLeft: 1, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}
                            inputProps={{MenuProps: {MenuListProps: {sx: {backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)"}}}}}
                            size="small"
                            disabled={(!animationEnded && started) || modoComparacion}
                        >
                            <MenuItem value={"astar"}>Algoritmo A*</MenuItem>
                            <MenuItem value={"bfs"}>Búsqueda en Amplitud (BFS)</MenuItem>
                            <MenuItem value={"dfs"}>Búsqueda en Profundidad (DFS)</MenuItem>
                        </Select>
                    </FormControl>

                    <div className="w-full">
                        <Button
                            id="locations-button"
                            aria-controls={menuOpen ? "locations-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? "true" : undefined}
                            onClick={(e) => {setMenuAnchor(e.currentTarget);}}
                            variant="contained"
                            disableElevation
                            style={{ backgroundColor: "#18181b", color: "#e4e4e7", fontSize: 15, paddingBlock: 11, justifyContent: "start", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}
                            className="w-full hover:bg-[#27272a] transition-colors"
                        >
                            Ubicaciones
                        </Button>
                        <Menu
                            id="locations-menu"
                            anchorEl={menuAnchor}
                            open={menuOpen}
                            onClose={() => {setMenuAnchor(null);}}
                            MenuListProps={{
                                "aria-labelledby": "locations-button",
                                sx: {
                                    backgroundColor: "#18181b",
                                    border: "1px solid rgba(255, 255, 255, 0.08)"
                                }
                            }}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            {LOCATIONS.map(location => 
                                <MenuItem key={location.name} onClick={() => {
                                    closeMenu();
                                    changeLocation(location);
                                }} className="hover:bg-[#27272a]">{location.name}</MenuItem>
                            )}
                        </Menu>
                    </div>

                    <div className="w-full pointer-events-auto flex flex-col">
                        <Typography id="area-slider" className="text-sm font-medium mb-2 text-zinc-300">
                            Radio del área: {settings.radio}km ({(settings.radio / 1.609).toFixed(1)}mi)
                        </Typography>
                        <Slider disabled={started && !animationEnded} min={2} max={20} step={1} value={settings.radio} onChangeCommited={() => { changeRadius(settings.radio); }} onChange={e => { setSettings({...settings, radio: Number(e.target.value)}); }} aria-labelledby="area-slider" style={{ marginBottom: 4 }} 
                            marks={[
                                {
                                    value: 2,
                                    label: "2km"
                                },
                                {
                                    value: 20,
                                    label: "20km"
                                }
                            ]} 
                        />
                    </div>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={mostrarRadio}
                                onChange={(e) => setMostrarRadio(e.target.checked)}
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: "#10b981",
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                        backgroundColor: "#10b981",
                                    },
                                }}
                            />
                        }
                        label={<Typography className="text-sm text-zinc-300">Mostrar radio del área</Typography>}
                        style={{ marginLeft: 0 }}
                    />

                    <div className="flex flex-col gap-4">
                        <Typography style={{ color: "#71717a", textTransform: "uppercase", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }} >
                            Estilos
                        </Typography>
                        
                        <div>
                            <Typography id="start-fill-label" className="text-sm mb-2 text-zinc-300">
                                Color de relleno del nodo inicial
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MuiColorInput value={arrayToRgb(colors.startNodeFill)} onChange={v => {setColors({...colors, startNodeFill: rgbToArray(v)});}} aria-labelledby="start-fill-label" style={{ backgroundColor: "#18181b", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }} />
                                <IconButton onClick={() => {setColors({...colors, startNodeFill: INITIAL_COLORS.startNodeFill});}} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: 40, width: 40, height: 40, borderRadius: "50%" }} size="small" className="hover:bg-[#27272a]">
                                    <Replay style={{ color: "#e4e4e7", width: 18, height: 18 }} fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="start-border-label" className="text-sm mb-2 text-zinc-300">
                                Color del área del radio de alcance
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MuiColorInput value={arrayToRgb(colors.startNodeBorder)} onChange={v => {setColors({...colors, startNodeBorder: rgbToArray(v)});}} aria-labelledby="start-border-label" style={{ backgroundColor: "#18181b", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }} />
                                <IconButton onClick={() => {setColors({...colors, startNodeBorder: INITIAL_COLORS.startNodeBorder});}} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: 40, width: 40, height: 40, borderRadius: "50%" }} size="small" className="hover:bg-[#27272a]">
                                    <Replay style={{ color: "#e4e4e7", width: 18, height: 18 }} fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="end-fill-label" className="text-sm mb-2 text-zinc-300">
                                Color de relleno del nodo final
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MuiColorInput value={arrayToRgb(colors.endNodeFill)} onChange={v => {setColors({...colors, endNodeFill: rgbToArray(v)});}} aria-labelledby="end-fill-label" style={{ backgroundColor: "#18181b", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }} />
                                <IconButton onClick={() => {setColors({...colors, endNodeFill: INITIAL_COLORS.endNodeFill});}} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: 40, width: 40, height: 40, borderRadius: "50%" }} size="small" className="hover:bg-[#27272a]">
                                    <Replay style={{ color: "#e4e4e7", width: 18, height: 18 }} fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="end-border-label" className="text-sm mb-2 text-zinc-300">
                                Color del borde del nodo final
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MuiColorInput value={arrayToRgb(colors.endNodeBorder)} onChange={v => {setColors({...colors, endNodeBorder: rgbToArray(v)});}} aria-labelledby="end-border-label" style={{ backgroundColor: "#18181b", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }} />
                                <IconButton onClick={() => {setColors({...colors, endNodeBorder: INITIAL_COLORS.endNodeBorder});}} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: 40, width: 40, height: 40, borderRadius: "50%" }} size="small" className="hover:bg-[#27272a]">
                                    <Replay style={{ color: "#e4e4e7", width: 18, height: 18 }} fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="path-label" className="text-sm mb-2 text-zinc-300">
                                Color del camino
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MuiColorInput value={arrayToRgb(colors.path)} onChange={v => {setColors({...colors, path: rgbToArray(v)});}} aria-labelledby="path-label" style={{ backgroundColor: "#18181b", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }} />
                                <IconButton onClick={() => {setColors({...colors, path: INITIAL_COLORS.path});}} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: 40, width: 40, height: 40, borderRadius: "50%" }} size="small" className="hover:bg-[#27272a]">
                                    <Replay style={{ color: "#e4e4e7", width: 18, height: 18 }} fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>
                        <div>
                            <Typography id="route-label" className="text-sm mb-2 text-zinc-300">
                                Color de la ruta más corta
                            </Typography>
                            <div className="flex gap-2 items-center">
                                <MuiColorInput value={arrayToRgb(colors.route)} onChange={v => {setColors({...colors, route: rgbToArray(v)});}} aria-labelledby="route-label" style={{ backgroundColor: "#18181b", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }} />
                                <IconButton onClick={() => {setColors({...colors, route: INITIAL_COLORS.route});}} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)", minWidth: 40, width: 40, height: 40, borderRadius: "50%" }} size="small" className="hover:bg-[#27272a]">
                                    <Replay style={{ color: "#e4e4e7", width: 18, height: 18 }} fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
                        <Typography style={{ color: "#71717a", textTransform: "uppercase", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }} >
                            Atajos de teclado
                        </Typography>

                        <div className="text-sm flex justify-between items-center">
                            <span className="font-mono bg-[#18181b] px-2.5 py-1.5 rounded-lg text-xs border border-white/5 text-zinc-300">ESPACIO</span>
                            <span className="text-zinc-400 text-xs">Iniciar/Detener</span>
                        </div>
                        <div className="text-sm flex justify-between items-center">
                            <span className="font-mono bg-[#18181b] px-2.5 py-1.5 rounded-lg text-xs border border-white/5 text-zinc-300">R</span>
                            <span className="text-zinc-400 text-xs">Limpiar ruta</span>
                        </div>
                        <div className="text-sm flex justify-between items-center">
                            <span className="font-mono bg-[#18181b] px-2.5 py-1.5 rounded-lg text-xs border border-white/5 text-zinc-300">Flechas</span>
                            <span className="text-zinc-400 text-xs">Reproducción</span>
                        </div>
                    </div>
                </div>
            </Drawer>

            {modoComparacion && (
                <div className={`fixed right-6 bottom-6 flex flex-col gap-3 transition-all duration-500 ease-out ${cinematic ? "translate-x-[250%] translate-y-[250%] opacity-0 pointer-events-none" : ""}`}>
                    <Tooltip title={ejecutandoComparacion ? "Detener Comparación" : "Iniciar Comparación"}>
                        <Button
                            disabled={!canStart && !ejecutandoComparacion}
                            onClick={() => {
                                if (ejecutandoComparacion) {
                                    detenerComparacion();
                                } else {
                                    iniciarComparacion();
                                }
                            }}
                            variant="contained"
                            style={{
                                backgroundColor: ejecutandoComparacion ? "#dc2626" : "#3b82f6",
                                color: "#fff",
                                paddingInline: 24,
                                paddingBlock: 14,
                                borderRadius: 14,
                                fontSize: 15,
                                fontWeight: 500,
                                boxShadow: ejecutandoComparacion ? "0 8px 24px 0 rgba(220, 38, 38, 0.35)" : "0 8px 24px 0 rgba(59, 130, 246, 0.35)"
                            }}
                            startIcon={ejecutandoComparacion ? <Stop /> : <CompareArrows />}
                            className={ejecutandoComparacion ? "hover:bg-[#b91c1c] transition-colors" : "hover:bg-[#2563eb] transition-colors"}
                        >
                            {ejecutandoComparacion ? "Detener" : "Comparar Algoritmos"}
                        </Button>
                    </Tooltip>
                </div>
            )}

            {modoComparacion && resultadosComparacion.length > 0 && (
                <>
                    {!tablaVisible && (
                        <div className={`fixed left-6 bottom-6 transition-all duration-500 ease-out ${cinematic ? "-translate-x-[250%] translate-y-[250%] opacity-0 pointer-events-none" : ""}`}>
                            <Tooltip title="Mostrar Resultados">
                                <Button
                                    onClick={() => setTablaVisible(true)}
                                    variant="contained"
                                    style={{
                                        backgroundColor: "#3b82f6",
                                        color: "#fff",
                                        paddingInline: 20,
                                        paddingBlock: 12,
                                        borderRadius: 14,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        boxShadow: "0 8px 24px 0 rgba(59, 130, 246, 0.35)"
                                    }}
                                    className="hover:bg-[#2563eb] transition-colors"
                                >
                                    Ver Resultados ({resultadosComparacion.length}/3)
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                    {tablaVisible && (
                        <div className={`fixed left-6 bottom-6 transition-all duration-500 ease-out ${cinematic ? "-translate-x-[250%] translate-y-[250%] opacity-0 pointer-events-none" : ""}`}>
                            <div className="bg-[#09090b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ minWidth: "600px", maxWidth: "700px" }}>
                                <div 
                                    className="flex justify-between items-center px-5 py-3 bg-[#18181b] border-b border-white/5 cursor-pointer hover:bg-[#27272a] transition-colors"
                                    onClick={() => setTablaVisible(!tablaVisible)}
                                >
                                    <Typography style={{ color: "#e4e4e7", fontWeight: 600, fontSize: 15 }}>
                                        Resultados de Comparación ({resultadosComparacion.length}/3)
                                    </Typography>
                                    <IconButton size="small" style={{ color: "#e4e4e7" }}>
                                        {tablaVisible ? <ExpandMore /> : <ExpandLess />}
                                    </IconButton>
                                </div>
                                <Collapse in={tablaVisible}>
                                    <div className="p-4">
                                        {ejecutandoComparacion && (
                                            <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg">
                                                <CircularProgress size={20} style={{ color: "#3b82f6" }} />
                                                <Typography style={{ color: "#3b82f6", fontSize: 13 }}>
                                                    Ejecutando comparación...
                                                </Typography>
                                            </div>
                                        )}
                                        <TableContainer component={Paper} style={{ backgroundColor: "#18181b", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow style={{ backgroundColor: "#27272a" }}>
                                                        <TableCell style={{ color: "#e4e4e7", fontWeight: 600, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: 13 }}>Algoritmo</TableCell>
                                                        <TableCell align="right" style={{ color: "#e4e4e7", fontWeight: 600, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: 13 }}>Tiempo (ms)</TableCell>
                                                        <TableCell align="right" style={{ color: "#e4e4e7", fontWeight: 600, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: 13 }}>Nodos</TableCell>
                                                        <TableCell align="right" style={{ color: "#e4e4e7", fontWeight: 600, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: 13 }}>Camino (km)</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {resultadosComparacion.map((resultado) => (
                                                        <TableRow key={resultado.algoritmo} style={{ backgroundColor: "#18181b" }}>
                                                            <TableCell style={{ color: "#e4e4e7", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: 13 }}>
                                                                {nombresAlgoritmos[resultado.algoritmo]}
                                                            </TableCell>
                                                            <TableCell align="right" style={{ color: "#a1a1aa", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: 13 }}>
                                                                {resultado.tiempoEjecucion.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell align="right" style={{ color: "#a1a1aa", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: 13 }}>
                                                                {resultado.nodosExplorados.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell align="right" style={{ color: "#a1a1aa", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: 13 }}>
                                                                {resultado.longitudCamino.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </Collapse>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
});

Interface.displayName = "Interface";

export default Interface;
