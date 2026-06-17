import { useParams, useNavigate } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { ArrowLeft, UploadCloud, Video, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminUpload() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [error, setError] = useState(null);
    
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm();

    const selectedFile = watch('videoFile')?.[0];

    const onSubmit = async (data) => {
        const file = data.videoFile[0];
        
        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Step 1: Get upload signature from backend
            const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
            const { signature, timestamp, public_id, api_key, upload_url } = signatureResponse.data;

            // Step 2: Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);

            // Step 3: Upload securely to Cloudinary using signature
            const uploadResponse = await axios.post(
                upload_url,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    },
                }
            );

            const cloudinaryResult = uploadResponse.data;

            // Step 4: Save video metadata to backend
            const metadataResponse = await axiosClient.post('/video/save', {
                problemId: problemId,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration,
            });
            
            setUploadedVideo({
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration,
                uploadedAt: new Date()
            });
            
            reset();
            
        } catch (err) {
            console.error('Upload error details:', err);
            let errorMessage = 'Upload failed. ';
            
            if (err.response?.data?.error?.message) {
                errorMessage += `Cloudinary Error: ${err.response.data.error.message}`;
            } else if (err.response?.data?.error) {
                errorMessage += err.response.data.error;
            } else if (err.response?.status === 400) {
                errorMessage += 'Bad Request - Check your API credentials and parameters.';
            } else if (err.response?.status === 401) {
                errorMessage += 'Unauthorized - Invalid API key or secret.';
            } else if (err.message) {
                errorMessage += err.message;
            }
            
            setError(errorMessage);
        } finally {
            setUploading(false);
            if (uploadProgress < 100) {
                setUploadProgress(0);
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden flex flex-col items-center justify-center py-20 px-4">
            <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10">
                <button 
                    onClick={() => navigate('/admin/video')}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-medium"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Videos
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay relative"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 shadow-glass">
                            <Film size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Upload Solution</h2>
                        <p className="text-slate-400 mt-2 text-sm font-medium">For Problem #{problemId}</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* File Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Video File</label>
                            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${errors.videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10'}`}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    {...register('videoFile', {
                                        required: 'Please select a video file',
                                        validate: {
                                            isVideo: (files) => {
                                                if (!files || !files[0]) return 'Please select a video file';
                                                return files[0].type.startsWith('video/') || 'Invalid video format';
                                            },
                                            fileSize: (files) => {
                                                if (!files || !files[0]) return true;
                                                return files[0].size <= 100 * 1024 * 1024 || 'Max size is 100MB';
                                            }
                                        }
                                    })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                                <div className="pointer-events-none flex flex-col items-center gap-3">
                                    <UploadCloud size={40} className={selectedFile ? 'text-indigo-400' : 'text-slate-500'} />
                                    {selectedFile ? (
                                        <div>
                                            <p className="text-white font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                                            <p className="text-indigo-400 text-xs mt-1">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-white font-bold text-sm">Click or drag video here</p>
                                            <p className="text-slate-500 text-xs mt-1">MP4, WebM (Max 100MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {errors.videoFile && <p className="text-red-400 text-sm mt-2 font-medium">{errors.videoFile.message}</p>}
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400">
                                    <span className="animate-pulse text-indigo-400">Uploading to Cloudinary...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 font-medium text-sm">
                                <AlertCircle size={20} className="shrink-0" />
                                <div>
                                    <p className="font-bold mb-1">Upload Error</p>
                                    <p className="opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {uploadedVideo && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex gap-3 text-emerald-400 font-medium text-sm">
                                <CheckCircle2 size={20} className="shrink-0" />
                                <div>
                                    <p className="font-bold mb-1">Upload Successful!</p>
                                    <p className="opacity-90 mb-2">Duration: {formatDuration(uploadedVideo.duration)}</p>
                                    <a 
                                        href={uploadedVideo.secureUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                    >
                                        <Video size={14} /> View Video
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            type="submit"
                            disabled={uploading || !selectedFile}
                            className={`w-full py-4 rounded-xl font-black text-white shadow-glass flex justify-center items-center gap-2 transition-all ${
                                uploading || !selectedFile 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={20} /> Upload Video
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default AdminUpload;