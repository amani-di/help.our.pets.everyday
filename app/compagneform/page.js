'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/compagneform.module.css';

export default function PostCampaignForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    location: '',
    description: '',
    objective: '',
    email: '',
    phone: '',
    images: []
  });
  
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check authentication and user type
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/signuplogin');
      return;
    }

    if (session.user.userType !== 'association') {
      router.push('/');
      return;
    }

    // Pre-fill email with association's email
    setFormData(prev => ({
      ...prev,
      email: session.user.email || ''
    }));
  }, [session, status, router]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (formData.images.length + files.length > 3) {
      alert('You can upload a maximum of 3 images.');
      return;
    }

    // Check file sizes (max 5MB per image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`The image ${file.name} is too large. Maximum size: 5MB`);
        return false;
      }
      return true;
    });

    const newImages = [...formData.images, ...validFiles];
    const newPreviewUrls = [];
    
    // Create preview URLs for each image
    newImages.forEach(file => {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      }
    });

    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setPreviewUrls(newPreviewUrls);
  };

  // Remove an image
  const removeImage = (indexToRemove) => {
    const updatedImages = formData.images.filter((_, index) => index !== indexToRemove);
    
    // Revoke preview URLs to avoid memory leaks
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    
    const updatedPreviewUrls = previewUrls.filter((_, index) => index !== indexToRemove);

    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
    setPreviewUrls(updatedPreviewUrls);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.objective.trim()) newErrors.objective = 'Objective is required';
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Date validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (endDate < startDate) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData object to send data and files
      const apiFormData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          apiFormData.append(key, formData[key]);
        }
      });
      
      // Add images
      formData.images.forEach(image => {
        apiFormData.append('images', image);
      });
      
      // Send data to API
      const response = await fetch('/api/compagne', {
        method: 'POST',
        body: apiFormData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error creating campaign');
      }
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setSubmitSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/cataloguecompagne');
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        form: `Form submission failed: ${error.message}`
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Province options
  const provinceOptions = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
    'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
    'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès',
    'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla'
  ];

  // Loading display during session verification
  if (status === 'loading') {
    return (
      <div className={styles.bodyContainer}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  // If no authorization, display nothing (redirect in progress)
  if (!session || session.user.userType !== 'association') {
    return null;
  }

  return (
    <div>
      <div className={styles.bodyContainer}>
        <div className={styles.formContainer}>
          {submitSuccess ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✓</div>
              <h2>Campaign submitted successfully!</h2>
              <p>Your campaign has been published.</p>
              <p>Redirecting to catalog...</p>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <h1>Campaign Announcement</h1>
                <p>They didn't choose this life. But you can choose to help</p>
                <p>Connected as: <strong>{session.user.name}</strong></p>
              </div>
              
              <form className={styles.campaignForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <h2 className={styles.sectionTitle}>Campaign Details:</h2>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="title">Campaign Title* :</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter a descriptive title for your campaign"
                      className={errors.title ? styles.errorInput : ''}
                    />
                    {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                  </div>
                  
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="startDate">Start Date* :</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={errors.startDate ? styles.errorInput : ''}
                      />
                      {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="endDate">End Date* :</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={errors.endDate ? styles.errorInput : ''}
                      />
                      {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="startTime">Start Time* :</label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={errors.startTime ? styles.errorInput : ''}
                      />
                      {errors.startTime && <span className={styles.errorText}>{errors.startTime}</span>}
                    </div>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="location">Location (Province)* :</label>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={errors.location ? styles.errorInput : ''}
                    >
                      <option value="">Select a province</option>
                      {provinceOptions.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.location && <span className={styles.errorText}>{errors.location}</span>}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <h2 className={styles.sectionTitle}>Campaign Information:</h2>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="description">Description* :</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your campaign and its activities"
                      className={errors.description ? styles.errorInput : ''}
                    ></textarea>
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="objective">Campaign Objective* :</label>
                    <textarea
                      id="objective"
                      name="objective"
                      rows="3"
                      value={formData.objective}
                      onChange={handleChange}
                      placeholder="What are the objectives and expected results of this campaign?"
                      className={errors.objective ? styles.errorInput : ''}
                    ></textarea>
                    {errors.objective && <span className={styles.errorText}>{errors.objective}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <h2 className={styles.sectionTitle}>Campaign Images:</h2>
                    
                    <div className={styles.imageUpload}>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={formData.images.length >= 3}
                      />
                      <label 
                        htmlFor="image" 
                        className={`${styles.uploadButton} ${formData.images.length >= 3 ? styles.disabled : ''}`}
                      >
                        <span>Choose images {`(${formData.images.length}/3)`}</span>
                      </label>
                    </div>
                    
                    {previewUrls.length > 0 && (
                      <div className={styles.imagePreviewContainer}>
                        {previewUrls.map((previewUrl, index) => (
                          <div key={index} className={styles.imagePreviewWrapper}>
                            <div 
                              className={styles.removeImageButton} 
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </div>
                            <img 
                              src={previewUrl} 
                              alt={`Preview ${index + 1}`} 
                              className={styles.imagePreview} 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <h2 className={styles.sectionTitle}>Contact Information:</h2>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Association Email* :</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your association's email"
                      className={errors.email ? styles.errorInput : ''}
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone Number (optional) :</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter a contact number"
                    />
                  </div>
                </div>
                
                {errors.form && <div className={styles.formError}>{errors.form}</div>}
                
                <div className={styles.formActions}>
                  <Link href="/" className={styles.cancelButton}>
                    Cancel
                  </Link>
              
              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Publish Campaign'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
   </div>
  
   </div>
  );
}