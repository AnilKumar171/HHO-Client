import React, { useState,useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { AppContext } from "../../../../context/Context";
import { useContext } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import LoadingAnimation from "../../../../components/LoadingAnimation";
const EditItemDialog = ({ handleClose, activity }) => {
  const {setAlertMsg,setOpen,setMsgType} = useContext(AppContext);

  const [btnText, setBtnText] = useState("Save");
  const [formData, setFormData] = useState({
    name: activity?.name || "",
    description: activity?.description || "",
    image: activity?.image || "",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setBtnText(<LoadingAnimation/>);
    let imageUrl = imageFile;
    if (imageFile instanceof File) {
      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      uploadData.append("upload_preset", "unsigned_upload");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dkzzeiqhh/image/upload",
          uploadData
        );
        imageUrl = response.data.secure_url;
        setFormData({...formData,image:imageUrl});
        console.log("Image uploaded", response.data.secure_url);
        console.log(formData);
      } catch (e) {
        console.error("Image upload failed:", e);
      }

    }
    axios.put(`http://localhost:8000/api/activities/update/${activity._id}`,formData)
        .then((res) => {
          setAlertMsg("Activity Edited..");
          setMsgType("success");
          setOpen(true);
          handleClose("edit");

          setBtnText("Save");
    }).catch(e=>console.log(e));
  };
  return (
    <Dialog
      open={true}
      onClose={() => handleClose("edit")}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            style={{ marginTop: "1vh" }}
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
          />

          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Typography variant="body2" color="textSecondary">
              Image Preview:
            </Typography>
            <img
              src={formData.image}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "contain",
                marginBottom: 10,
              }}
            />
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="upload-button"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="upload-button">
              <Button
                component="span"
                startIcon={<CloudUploadIcon />}
                variant="outlined">
                Upload Image
              </Button>
            </label>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose("edit");
          }}
          color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          {btnText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditItemDialog;
